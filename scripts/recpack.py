
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
