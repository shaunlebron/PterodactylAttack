#!/usr/bin/env python
import sys
import subprocess
import json
import math

usage = """

resizeTiles.py <filename> <newname>

Resize a given image and its respective mosaic metadata to a smaller power of 2.

"""

def getImageSize(filename):
	output = subprocess.check_output(["identify",filename])
	return map(int,output.split()[2].split('x'))

def getPowerOf2Size(width,height):
	newWidth  = 2**int(math.log(width,2))
	newHeight = 2**int(math.log(height,2))
	
	if width > height:
		return { "width": newWidth, "scale": float(newWidth) / width }
	else:
		return { "height": newHeight, "scale": float(newHeight) / height }

def createResizedImage(filename, newSize, newfilename):
	if "width" in newSize:
		resize_arg = str(newSize["width"])
	else:
		resize_arg = "x%d" % newSize["height"]
	subprocess.call(["convert",filename,"-resize",resize_arg,newfilename])

def makeRescaledMosaic(filename, newfilename):
	origWidth, origHeight = getImageSize(filename)

	newSize = getPowerOf2Size(origWidth, origHeight)

	createResizedImage(filename, newSize, newfilename)

	newWidth, newHeight = getImageSize(newfilename)

	with open(filename+".json") as f:
		metadata = json.load(f)

	scale = newSize["scale"]

	metadata["scale"] /= scale

	for obj in metadata["mosaic"].values():
		obj["origSize"]["width"] *= scale
		obj["origSize"]["height"] *= scale

		for tile in obj["tiles"]:
			# These four numbers need to be kept inside the image dimensions, or we get errors
			# (hopefully truncating can be enough to satisfy that)
			x = int(tile["x"] * scale)
			y = int(tile["y"] * scale)
			w = int(tile["w"] * scale)
			h = int(tile["h"] * scale)

			if x+w >= newWidth or y+h >= newHeight:
				raise Exception("out of image bounds")

			tile["x"] = x
			tile["y"] = y
			tile["w"] = w
			tile["h"] = h

			tile["origX"] *= scale
			tile["origY"] *= scale

	with open(newfilename+".json",'w') as f:
		json.dump(metadata,f,indent=4)


if __name__ == "__main__":
	args = sys.argv[1:]

	if len(args) != 2:
		print usage
		sys.exit(1)
	
	filename = args[0]
	newfilename = args[1]

	makeRescaledMosaic(filename, newfilename)
