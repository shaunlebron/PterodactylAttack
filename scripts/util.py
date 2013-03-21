import png
import sys
import subprocess
import os
import glob

class IslandBounds:
	def __init__(self,x,y,_id):
		self._id = _id
		self.minx = x
		self.maxx = x
		self.miny = y
		self.maxy = y

	def getWidth(self):
		return self.maxx - self.minx + 1;

	def getHeight(self):
		return self.maxy - self.miny + 1;

	def addPixel(self,x,y):
		self.minx = min(x,self.minx)
		self.maxx = max(x,self.maxx)
		self.miny = min(y,self.miny)
		self.maxy = max(y,self.maxy)

	def addIsland(self,other):
		self.minx = min(self.minx, other.minx)
		self.maxx = max(self.maxx, other.maxx)
		self.miny = min(self.miny, other.miny)
		self.maxy = max(self.maxy, other.maxy)

	def doesContain(self,other):
		return (
			self.minx <= other.minx and other.maxx <= self.maxx and
			self.miny <= other.miny and other.maxy <= self.maxy)

	def isDisjointFrom(self,other):
		return (
			self.maxx < other.minx or other.maxx < self.minx or
			self.maxy < other.miny or other.maxy < self.miny)

	def intersects(self,other):
		return not self.isDisjointFrom(other)

class IslandFinderFunction:

	def reset(self):
		# number of islands created so far (used for island IDs)
		self.islandCount = 0

		# list of IslandBound objects
		self.islands = []

		# map from island ID to parent IslandBound object
		self.islandIdToParent = {}

		# map from pixel to island ID
		self.pixelToIslandId = {}

	def xytoi(self,x,y):
		if x < 0 or y < 0 or x >= self.w or y >= self.h:
			return None
		return x + y*self.w

	def getIslandOwner(self,_id):
		"""
		Since we merge islands, this function tells us which island has resumed ownership over the given island ID.
		input: island ID
		output: IslandBound object
		"""
		while True:
			parentIsland = self.islandIdToParent[_id]
			if _id == parentIsland._id:
				return parentIsland
			_id = parentIsland._id

	def getIslandFromPixel(self,x,y):
		"""
		Returns the owner island containing the given pixel.
		intput: pixel x,y
		output: IslandBound object
		"""
		i = self.xytoi(x,y)
		try:
			_id = self.pixelToIslandId[i]
			return self.getIslandOwner(_id)
		except KeyError:
			return None

	def addPixelToIsland(self,x,y,i,island):
		island.addPixel(x,y)
		self.pixelToIslandId[i] = island._id

	def makeNewIsland(self,x,y,i):
		_id = self.islandCount
		island = IslandBounds(x,y,_id)
		self.islands.append(island)
		self.islandIdToParent[_id] = island
		self.pixelToIslandId[i] = _id
		self.islandCount += 1
		return island

	def mergeIslands(self,islands):
		owner = islands[0]
		for island in islands[1:]:
			self.islandIdToParent[island._id] = owner
			self.islands.remove(island)
		return owner

	def getAdjacentIslands(self,x,y):
		"""
		We want to merge the islands belonging to the adjacent pixels(*)
		around the current pixel(X):

		.......
		..***..
		..*X...
		.......

		These are the only pixels we are checking due to our row-major search order.

		input: xy pixel
		output: generator for iterating the islands
		"""
		for x0,y0 in ((x-1,y-1), (x,y-1), (x+1,y-1), (x-1,y)):
			island = self.getIslandFromPixel(x0,y0)
			if island:
				yield island

	def mergeAdjacentIslands(self,x,y):

		islandsToMerge = []
		for island in iterIslandMergeCandidates():
			if not island in islandsToMerge:
				islandsToMerge.append(island)

		numToMerge = len(islandsToMerge)
		if numToMerge == 0:
			return None
		elif numToMerge == 1:
			return islandsToMerge[0]
		else:
			return self.mergeIslands(islandsToMerge)

	def __call__(self,w,h,pixelIter):
		"""
		input: pixelIter: row-major order iterator returning (x,y,i,isSolid)
		"""
		self.w = w
		self.h = h
		self.reset()

		for x,y,i,isSolid in pixelIter():
			if not isSolid:
				continue
			island = self.findAdjacentRegion(x,y)
			if island:
				self.addPixelToIsland(x,y,i,island)
			else:
				self.makeNewIsland(x,y,i)
		return self.islands

# I'm using the class above as a singleton to hold
# the intermediate states and helper functions for
# this main function for finding islands.
findIslands = IslandFinderFunction()

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

# Packing algorithm from:
#	http://www.codeproject.com/Articles/210979/Fast-optimizing-rectangle-packing-algorithm-for-bu

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
