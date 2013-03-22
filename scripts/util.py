import png
import sys
import subprocess
import os
import glob

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
	return findIslands(w,h,pixelIter)

def packRegions(regions):
	"""
	input: list of regions with (name,w,h) properties
	output: 
	"""

	w,h = 0,0
	for r in regions:
		h = max(h, r.getHeight())
		w += r.getWidth()

	packer = RectanglePacker(w,h)


if __name__ == "__main__":

	imagenames = ["img/grass%02d.png" % i for i in range(1)]
	
	imageRegions = getCroppableRegionsFromImages(imagenames)

	for f in glob.glob("regions/*"):
		os.remove(f)

	for imagename,regions in imageRegions:
		for i,r in enumerate(regions):
			x = r["minx"]
			y = r["miny"]
			w = r["maxx"]-x+1
			h = r["maxy"]-y+1
			base = os.path.basename(imagename)
			base = os.path.splitext(base)[0]
			region_name = "%s_%03d.png" % (base,i)
			print "cropping region",region_name
			subprocess.call([
				"convert",
				imagename,
				"-crop",
				"%dx%d+%d+%d" % (w,h,x,y),
				"+repage",
				"regions/%s" % region_name])

	subprocess.call(["./sprites.sh", "regions"])

	# TODO: read sprites.txt for image positions
	#		line = <image_name> x y
	# TODO: output final metadata (see 'notes')
