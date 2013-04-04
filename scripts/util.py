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
			pixels[(x,y)] = {
				"color": (r,g,b,a),
				"island": None
			}
			isSolid = (a > 0)
			yield x,y,i,isSolid
	findIslands(w,h,pixelIter)
	findIslands.minimalAreaMerge()
	for x,y in pixels:
		pixels[(x,y)]["island"] = findIslands.getIslandFromPixel(x,y)
	return findIslands.islands, pixels

def packImages(filenames,packed_image_name):

	# Get all islands
	all_islands = []
	filename_islands = {}
	filename_pixels = {}
	for filename in filenames:
		islands,pixels = getIslandsInPng(filename)
		filename_islands[filename] = islands
		filename_pixels[filename] = pixels
		all_islands.extend(finder.islands)
		for i,island in enumerate(islands):
			island.name = "%s_%03d" % (filename, i)
			island.w = island.maxx - island.minx + 1
			island.h = island.maxy - island.miny + 1

	# Calculate packed image size and placements.
	w,h,pos,packer = getOptimalRecPack(all_islands)

	# Create image of size (w,h)
	packed_image = numpy.zeros((h,w,4),dtype=numpy.int)
	def setPixel(x,y,color):
		packed_image[y,x] = color

	# Draw islands to packed image
	for filename in filenames:
		islands = filename_islands[filename]
		pixels = filename_pixels[filename]
		for (x,y),pixel in pixels.items():
			island = pixel["island"]
			p = pos[island.name]
			setPixel(
				x - island.minx + p.x,
				y - island.miny + p.y,
				pixel["color"])

	# Write packed image.
	pngWriter = png.Writer(size=(w,h),alpha=True)
	with open(packed_image_name,"w") as f:
		pngWriter.write(f, packed_image.reshape((-1)))

	# Create meta data for packed image.
	regions = {}
	for filename in filenames:
		regions[filename] = []
		for island in filename_islands[filename].islands:
			p = pos[island.name]
			r = {
				"w": island.w,
				"h": island.h,
				"x": p[0],
				"y": p[1],
				"origX": island.minx,
				"origY": island.miny,
				"origCenterX": island.minx + w/2,
				"origCenterY": island.miny + h/2,
			}
			regions[filename].append(r)
	output = {
		"regions": regions
	}

	# Write meta data.
	with open(packed_image_name+".json","w") as f:
		json.dump(f, output)

if __name__ == "__main__":
	
	args = sys.argv[1:]
	if len(args) <= 1:
		print usage_str
		sys.exit(1)

	filenames = args[:-1]
	output = args[-1]
	
	packImages(filenames,output)

