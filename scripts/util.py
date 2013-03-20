import png
import sys
import subprocess
import os
import glob

def getCroppableRegions(filename):
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

	def xytoi(x,y):
		if x < 0 or y < 0 or x >= w or y >= h:
			return None
		return x + y*w

	regionCount = {
		"count": 0,
	}
	regions = []
	regionLookup = {}
	regionIndexFromPixel = {}
	def getRegionFromPixel(x,y):
		i = xytoi(x,y)
		try:
			index = regionIndexFromPixel[i]
			while True:
				region = regionLookup[index]
				index2 = region["index"]
				if index2 == index:
					return region
				else:
					index = index2
			#print "   index",index,"goes to",region["index"]
			return region
		except KeyError:
			return None

	def addPixelToRegion(x,y,i,region):
		region["minx"] = min(x,region["minx"])
		region["maxx"] = max(x,region["maxx"])
		region["maxy"] = max(y,region["maxy"])
		regionIndexFromPixel[i] = region["index"]

	def makeNewRegion(x,y,i):
		index = regionCount["count"]
		region = {
			"minx": x,
			"maxx": x,
			"miny": y,
			"maxy": y,
			"index":index
			}
		regions.append(region)
		regionLookup[index] = region
		regionIndexFromPixel[i] = index
		regionCount["count"] += 1
		return region

	def findAdjacentRegion(x,y):
		adj_regions = []

		def iterAdjRegions():
			for x0,y0 in ((x-1,y-1), (x,y-1), (x+1,y-1), (x-1,y)):
				region = getRegionFromPixel(x0,y0)
				if region:
					yield region

		for region in iterAdjRegions():
			if not region in adj_regions:
				adj_regions.append(region)

		if not adj_regions:
			return None

		if len(adj_regions) == 1:
			return adj_regions[0]

		def mergeRegions(rs):
			r0 = rs[0]
			#print "merging to",r0["index"]
			for r in rs[1:]:
				r0["minx"] = min(r0["minx"], r["minx"])
				r0["maxx"] = max(r0["maxx"], r["maxx"])
				r0["miny"] = min(r0["miny"], r["miny"])
				r0["maxy"] = max(r0["maxy"], r["maxy"])
				regionLookup[r["index"]] = r0
				#print "removing region index",r["index"]
				regions.remove(r)
			return r0

		#print "merging %s" % ",".join(str(x) for x in adj_indexes)
		return mergeRegions(adj_regions)

	def onSolidPixel(x,y,i):
		#print x,y,i
		region = findAdjacentRegion(x,y)
		if region:
			#print "   appending region to",region["index"]
			addPixelToRegion(x,y,i,region)
		else:
			region = makeNewRegion(x,y,i)
			#print "   new region",region["index"]

	for x,y,i,r,g,b,a in iterPixels():
		if a > 0:
			onSolidPixel(x,y,i)

	return regions

def getCroppableRegionsFromImages(filenames):
	imageRegions = []
	for filename in filenames:
		imageRegions.append((filename,getCroppableRegions(filename)))
	return imageRegions

class RectanglePacker:

	def __init__(self,w,h):
		self.rows = 1
		self.cols = 1
		self.w = w
		self.h = h
		self.isFilled = [[False]] # row major order
		self.rowHeights = [h]
		self.colWidths = [w]

	def insert(self,w,h):
		"""
		output: x,y top left coord
		"""
		result = self.findCell(w,h)
		if result:
			x,y,r,c,r0,c0,w0,h0 = result
			fillCells(r,c,r0,c0,w0,h0)
			return x,y
		return None

	def findCell(self,w,h):
		"""
		output:
			x,y = top-left coord
			r,c = top-left cell
			r0,c0 = bottom-right cell
			w0,h0 = size in bottom-right cell
		"""
		def iterCol():
			x,c = 0,0
			while x+w <= self.w:
				yield x,c
				x += self.colWidths[c]
				c += 1
		def iterRow():
			y,r = 0,0
			while y+h <= self.h:
				yield y,r
				y += self.rowHeights[r]
				r += 1

		for x,c in iterCol():
			rowIter = iterRow()
			for y,r in rowIter:
				r0,c0,w0,h0 = self.tryFit(r,c,w,h)
				if w0 > 0:
					return (x,y,r,c,r0,c0,w0,h0)
				while r <= r0:
					y += self.rowHeights[r]
					r += 1
					rowIter.next()
		return None

	def tryFit(self,r,c,w,h):
		"""
		precondition: must be guaranteed not to overflow
		output: (r0,c0,w0,h0)
			if success, position and size of bottom-right filled cell
			if failure, position of blocking cell, and zero-size
		"""

		# Determine the furthest right column and the width in that column
		c0, w0 = c,w
		while w0 > self.colWidths[c0]:
			w0 -= self.colWidths[c0]
			c0 += 1

		# Determine the furthest bottom row and the height in that row
		r0, h0 = r,h
		while h0 > self.rowHeights[r0]:
			h0 -= self.rowHeights[r0]
			r0 += 1

		for _r in xrange(r,r0+1):
			for _c in xrange(c,c0+1):
				if self.isFilled[_r][_c]:
					return (_r,_c,0,0)

		return (r0,c0,w0,h0)

	def fillCells(self,r,c,r0,c0,w0,h0):

		# Fill all internal cells
		for _r in xrange(r,r0):
			for _c in xrange(c,c0):
				self.isFilled[_r][_c] = True

		# Split column if width not filled.
		if w0 < self.colWidths[c0]:
			self.splitCol(c0,w0)

		# Split row if height not filled.
		if h0 < self.rowHeights[r0]:
			self.splitRow(r0,h0)

		# Fill the edge column cells.
		for _r in xrange(r,r0+1):
			self.isFilled[_r][c0] = True

		# Fill the edge row cells.
		for _c in xrange(c,c0+1):
			self.isFilled[r0][_c] = True

	def splitCol(self,i,w):
		# Duplicate the ith cell in each row.
		for row in self.isFilled:
			row.insert(i+1, row[i])

		# Split the width between the two columns.
		self.colWidths.insert(i+1, self.colWidths[i]-w)
		self.colWidths[i] = w

		# Increment column count.
		self.cols += 1

	def splitRow(self,i,h):
		# Duplicate the ith row.
		row = self.isFilled[i]
		self.isFilled.insert(i+1,row[:])

		# Split the height between the two rows.
		self.rowHeights.insert(i+1, self.rowHeights[i]-h)
		self.rowHeights[i] = h

		# Increment row count.
		self.rows += 1

def packRegions(regions):
	"""
	input: list of regions with (name,w,h) properties
	output: 
	"""

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
