class IslandBounds:
	"""
	An "island" is a contiguous shape on an image. 
	This class defines the axis-aligned bounding box around such an island.
	"""

	def __init__(self,_id=0,**kwargs):
		self._id = _id
		for key in "minx miny maxx maxy".split():
			if key in kwargs:
				setattr(self, key, kwargs[key])

	def __str__(self):
		return "x=(%d, %d) y=(%d, %d)" % (self.minx,self.maxx, self.miny,self.maxy)

	def toJsonStr(self):
		s = '{'
		s += '"minx": %d,' % self.minx
		s += '"maxx": %d,' % self.maxx
		s += '"miny": %d,' % self.miny
		s += '"maxy": %d' % self.maxy
		s += '}'
		return s

	def isEquivalentTo(self, other):
		return (
			self.minx == other.minx and
			self.maxx == other.maxx and
			self.miny == other.miny and
			self.maxy == other.maxy)

	def copy(self):
		_copy = IslandBounds()
		_copy.addIsland(self)
		return _copy

	def getWidth(self):
		return self.maxx - self.minx + 1;

	def getHeight(self):
		return self.maxy - self.miny + 1;

	def getArea(self):
		return self.getWidth() * self.getHeight()

	def addX(self,x):
		try:
			self.minx = min(x, self.minx)
			self.maxx = max(x, self.maxx)
		except AttributeError:
			self.minx = self.maxx = x

	def addY(self,y):
		try:
			self.miny = min(y, self.miny)
			self.maxy = max(y, self.maxy)
		except AttributeError:
			self.miny = self.maxy = y

	def addPixel(self,x,y):
		self.addX(x)
		self.addY(y)

	def addIsland(self,other):
		self.addPixel(other.minx, other.miny)
		self.addPixel(other.maxx, other.maxy)

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

	def getAreaDeltaFromMerge(self, other):
		separate_area = self.getArea() + other.getArea()
		merge = self.copy()
		merge.addIsland(other)
		merged_area = merge.getArea()
		return merged_area - separate_area

class IslandFinderFunction:
	"""
	An "island" is a contiguous shape on an image. 
	This is a function class for identify all the islands from a single image.
	"""

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
		island = IslandBounds(_id)
		island.addPixel(x,y)
		self.islands.append(island)
		self.islandIdToParent[_id] = island
		self.pixelToIslandId[i] = _id
		self.islandCount += 1
		return island

	def mergeIslands(self,islands):
		owner = islands[0]
		children = islands[1:]
		for child in children:
			owner.addIsland(child)
			self.islandIdToParent[child._id] = owner
			self.islands.remove(child)
		return owner

	def mergeAdjacentIslands(self,x,y):
		"""
		We want to merge the islands belonging to the adjacent pixels(*)
		around the current solid pixel(X):

		.......
		..***..
		..*X...
		.......

		These are the only pixels we are checking due to our row-major search order.

		input: xy pixel
		output: a single merged island from adjacent islands if they exist, otherwise None
		"""
		islandsToMerge = []
		for x0,y0 in ((x-1,y-1), (x,y-1), (x+1,y-1), (x-1,y)):
			island = self.getIslandFromPixel(x0,y0)
			if island and not island in islandsToMerge:
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
			island = self.mergeAdjacentIslands(x,y)
			if island:
				self.addPixelToIsland(x,y,i,island)
			else:
				self.makeNewIsland(x,y,i)
		return self.islands

	def minimalAreaMerge(self):
		"""
		Merge any two of the created islands if the bounding box around both has
		less area than the sum of their separate bounding boxes.
		"""

		def shouldMerge(a,b):
			delta_area = a.getAreaDeltaFromMerge(b)
			return delta_area < 1024

		def tryMerge():
			numIslands = len(self.islands)
			for i in xrange(numIslands):
				a = self.islands[i]
				for j in xrange(i+1,numIslands):
					b = self.islands[j]
					if shouldMerge(a,b):
						self.mergeIslands([a,b])
						return True
			return False
			
		while tryMerge(): pass

		return self.islands

	def iterIslandPixels(self,island):
		for y in xrange(island.miny, island.maxy+1):
			for x in xrange(island.minx, island.maxx+1):
				p = self.getIslandFromPixel(x,y)
				if p == island:
					yield x,y

# I'm using the class above as a singleton to hold
# the intermediate states and helper functions for
# this main function for finding islands.
findIslands = IslandFinderFunction()
