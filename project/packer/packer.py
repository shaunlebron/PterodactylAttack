#!/usr/bin/env python

import png
import sys
import subprocess
import os
import glob
import json
import numpy

usage_str = """

%s image [images...] output_image

Try to pack the objects in the given images into a single image.
Create a metadata file that provides the following for each found object:
	* size
	* position in the packed image
	* filename of the original image
	* position in the original image

""" % (os.path.basename(__file__))

from recpack import *
from island import *

def pngHelper(filename):
	"""
	Return the size and a pixel iterator for the given png file.
	"""
	reader = png.Reader(filename=filename)
	w,h,iterator,meta = reader.asRGBA()
	def iterPixels():
		y = -1
		i = -1
		for row in iterator:
			y += 1
			for x in xrange(w):
				i += 1
				r,g,b,a = row[x*4:(x+1)*4]
				yield x,y,i,r,g,b,a
	return w,h,iterPixels

def getIslandsInPng(filename):
	"""
	Return a list of islands and pixel map.
	Pixel map contains non empty pixels.  Each has a color and an associated island.
	"""
	w,h,pngIter = pngHelper(filename)
	pixels = {}
	def pixelIter():
		for x,y,i,r,g,b,a in pngIter():
			isSolid = (a > 0)
			if isSolid:
				pixels[(x,y)] = { "color": (r,g,b,a) }
			yield x,y,i,isSolid
	findIslands(w,h,pixelIter)
	findIslands.minimalAreaMerge()
	for x,y in pixels:
		pixels[(x,y)]["island"] = findIslands.getIslandFromPixel(x,y)
	return w,h,findIslands.islands, pixels

def packImages(input_images,output_image):
	"""
	Take a list of input images, find their islands (contiguous regions)
	then pack all islands into a given output image with an associated
	meta file stating the position and original image of each island.
	"""

	# Get all islands
	print "Locating islands..."
	all_islands = []
	filename_islands = {}
	filename_pixels = {}
	filename_size = {}
	for filename in input_images:
		print "  "+filename
		w,h,islands,pixels = getIslandsInPng(filename)
		filename_size[filename] = {
			"width": w,
			"height": h,
		}
		filename_islands[filename] = islands
		filename_pixels[filename] = pixels
		all_islands.extend(islands)
		for i,island in enumerate(islands):
			island.name = "%s_%03d" % (filename, i)
			island.w = island.maxx - island.minx + 1
			island.h = island.maxy - island.miny + 1

	# Calculate packed image size and placements.
	print "Calculating packed partitions..."
	result = getOptimalRecPack(all_islands, globalMaxWidth=2048, globalMaxHeight=2048)
	if result:
		w,h,pos,packer = result
	else:
		print "could not pack"
		sys.exit(1)

	# Create image of size (w,h)
	packed_image = numpy.zeros((h,w,4),dtype=numpy.int)
	def setPixel(x,y,color):
		packed_image[y,x] = color

	# Draw islands to packed image
	print "Drawing islands to packed buffer..."
	for filename in input_images:
		islands = filename_islands[filename]
		pixels = filename_pixels[filename]
		for (x,y),pixel in pixels.items():
			island = pixel["island"]
			px,py = pos[island.name]
			setPixel(
				x - island.minx + px,
				y - island.miny + py,
				pixel["color"])

	# Write packed image.
	print "Writing packed image..."
	pngWriter = png.Writer(size=(w,h),alpha=True)
	with open(output_image,"w") as f:
		#pngWriter.write(f, packed_image.reshape((-1)))
		pngWriter.write(f, numpy.reshape(packed_image, (-1, w*4)))

	# Create meta data for packed image.
	print "Writing packed meta data file..."
	mosaic = {}
	for filename in input_images:
		tiles = []
		key = os.path.basename(filename)
		mosaic[key] = {
			"origSize": filename_size[filename],
			"tiles": tiles,
		}
		for island in filename_islands[filename]:
			p = pos[island.name]
			tiles.append({
				"w": island.w,
				"h": island.h,
				"x": p[0],
				"y": p[1],
				"origX": island.minx,
				"origY": island.miny,
			})

	# Write meta data.
	with open(output_image+".json","w") as f:
		output = { "mosaic": mosaic }
		json.dump(output, f, indent=4, sort_keys=True)

if __name__ == "__main__":
	
	args = sys.argv[1:]
	if len(args) < 2:
		print usage_str
		sys.exit(1)

	input_images = args[:-1]
	output_image = args[-1]
	
	packImages(input_images,output_image)

