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
	w,h,pngIter = pngHelper(filename)
	def pixelIter():
		for x,y,i,r,g,b,a in pngIter():
			isSolid = (a > 0)
			yield x,y,i,isSolid
	findIslands = IslandFinderFunction()
	findIslands(w,h,pixelIter)
	findIslands.minimalAreaMerge()
	return findIslands

def packImages(filenames):

	all_islands = []
	filename_islands = {}
	for filename in filenames:
		finder = getIslandsInPng(filename)
		filename_islands[filename] = finder
		all_islands.extend(finder.islands)
		for i,island in enumerate(finder.islands):
			island.name = "%s_%03d" % (filename, i)
			island.w = island.maxx - island.minx + 1
			island.h = island.maxy - island.miny + 1

	w,h,pos,packer = getOptimalRecPack(all_islands)
	#image = numpy.array(

	regions = {}
	for filename in filenames:
		regions[filename] = []
		for island in filename_islands[filename]:
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

if __name__ == "__main__":
	
	args = sys.argv[1:]
	if len(args) <= 1:
		print usage_str
		sys.exit(1)

	filenames = args[:-1]
	output = args[-1]
	
	packImages(filenames,output)

