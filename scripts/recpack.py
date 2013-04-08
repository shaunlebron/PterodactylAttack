
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

	def getEnclosingHeight(self):
		"""
		Get the height of the enclosing rectangle.
		"""
		def isLastFilledRowOnEdge():
			return any(self.isFilled[-1])

		if isLastFilledRowOnEdge():
			return self.h
		else:
			return self.h - self.rowHeights[-1]

	def getEnclosingWidth(self):
		"""
		Get the width of the enclosing rectangle.
		"""
		def isLastFilledColOnEdge():
			for cols in self.isFilled:
				if cols[-1]:
					return True
			return False

		if isLastFilledColOnEdge():
			return self.w
		else:
			return self.w - self.colWidths[-1]
				

	def insert(self,w,h):
		"""
		output: x,y top left coord
		"""
		result = self.findCell(w,h)
		if result:
			x,y,r,c,r0,c0,w0,h0 = result
			self.fillCells(r,c,r0,c0,w0,h0)
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
				else:
					try:
						while r < r0:
							r += 1
							rowIter.next()
					except StopIteration:
						pass
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

def getOptimalRecPack(recs,globalMaxWidth=None,globalMaxHeight=None):
	"""
	Find the rectangle of least area to pack the given rectangles.
	Optionally, set the max width and height of the enclosing rectangle.
	input: recs (list of rectangle objects with "name", "w", and "h" properties)
	output: width and height of enclosing rectangle, and dictionary from rectangle name -> position
	"""

	# Sorted by decreasing height.
	recs = sorted(recs, key=lambda r:r.h, reverse=True)
	
	def trySize(w,h):
		"""
		Helper function to try a given enclosing rectangle size.
		input: dimensions of enclosing rectangle
		output: partition positions, enclosing area, and packer object
		"""
		print "trying size %dx%d..." % (w,h)
		pos = {}
		packer = RectanglePacker(w, h)
		for r in recs:
			result = packer.insert(r.w, r.h)
			if not result:
				return None
			pos[r.name] = result

		encW = packer.getEnclosingWidth()
		encH = packer.getEnclosingHeight()
		area = encW * encH

		print "success."
		return encW,encH,pos,area,packer
	
	# Get info about the given rectangles.
	totalArea = sum(r.w * r.h for r in recs)
	sumW = sum(r.w for r in recs)
	sumH = sum(r.h for r in recs)
	maxW = max(r.w for r in recs)
	maxH = max(r.h for r in recs)

	# Set defaults for the max width and height of the enclosing rectangle.
	if globalMaxHeight is None:
		globalMaxHeight = sumH
	if globalMaxWidth is None:
		globalMaxWidth = sumW
	else:
		globalMaxWidth = min(sumW, globalMaxWidth)

	# Try initial size
	w = globalMaxWidth
	h = maxH*2
	result = trySize(w,h)
	if not result:
		return None

	# Set the initial optimum results
	optW, optH, optPos,optArea,optPacker = result

	def nextSize(w,h):
		"""
		Helper function to proceed to the next valid size.
		"""
		while True:
			while w*h < totalArea:
				h += 1
			if w*h <= optArea:
				break
			while w*h > optArea:
				w -= 1
		return w,h

	def printResult(w,h,pos):
		print "var packer = {"
		print '    "w": %d,' % w
		print '    "h": %d,' % h
		for r in recs:
			p = pos[r.name]
			print '    "%s": {"x":%d, "y":%d},' % (r.name, p[0], p[1])
		print "};"

	step = 10
	w -= step
	w,h = nextSize(w,h)

	while w >= maxW and h <= globalMaxHeight and w >= h:
		result = trySize(w,h)
		if result:
			optW,optH,pos,area,packer = result
			if area == optArea:
				pass
			elif area < optArea:
				optW = w
				optH = h
				optPos = pos
				optArea = area
				optPacker = packer
				#printResult(optW,optH,optPos)
			w -= step
		else:
			h += step

		w,h = nextSize(w,h)

	return optW, optH, optPos, optPacker
