
import unittest

from island import *

class TestIslandBounds(unittest.TestCase):

	def test_one_point(self):
		island = IslandBounds()
		x,y = 4,5
		island.addPixel(x,y)

		self.assertEqual(island.minx, x)
		self.assertEqual(island.maxx, x)
		self.assertEqual(island.miny, y)
		self.assertEqual(island.maxy, y)

		self.assertEqual(island.getWidth(), 1)
		self.assertEqual(island.getHeight(), 1)

	def test_two_points(self):
		island = IslandBounds()
		minx,miny = 4,5
		maxx,maxy = 50,30
		island.addPixel(minx,miny)
		island.addPixel(maxx,maxy)

		self.assertEqual(island.minx, minx)
		self.assertEqual(island.maxx, maxx)
		self.assertEqual(island.miny, miny)
		self.assertEqual(island.maxy, maxy)

		self.assertEqual(island.getWidth(), maxx-minx+1)
		self.assertEqual(island.getHeight(), maxy-miny+1)

	def test_copy(self):
		island = IslandBounds()
		minx,miny = 4,5
		maxx,maxy = 50,30
		island.addPixel(minx,miny)
		island.addPixel(maxx,maxy)

		copy = island.copy()

		self.assertEqual(island.minx, copy.minx)
		self.assertEqual(island.maxx, copy.maxx)
		self.assertEqual(island.miny, copy.miny)
		self.assertEqual(island.maxy, copy.maxy)

class TestIslandFinder(unittest.TestCase):

	def test_small(self):

		w,h = 13,7
		space = (
			# 0 1 2 3 4 5 6 7 8 9 0 1 2
			" . . . . # # # # . . # . . " + # 0
			" . . . . . # # . . . # . . " + # 1
			" # # . # # # . . # . # . # " + # 2
			" # # . . # # # # # # # . # " + # 3
			" # . . . . . . . . . . . # " + # 4
			" # # # . . . . . . # # # # " + # 5
			" # . . . . . . . # # # . # " + # 6
			"").split()

		def pixelIter():
			"""
			A row-major order iterator of our test-space.
			"""
			x,y,i = 0,0,0
			for i,c in enumerate(space):
				x = i % w
				y = i / w
				isSolid = (c=='#')
				yield x,y,i,isSolid
				printSpace(x,y) # print state for debugging

		def printSpace(x0,y0):
			"""
			Help debug the underlying algorithm by printing the state at each step.
			input: current xy location
			output: visual map of pixels and their island labels
			"""
			print

			# keep track of the island ids
			ids = set()

			# convert id to a letter
			def idChr(_id):
				return chr(_id+97)

			# print the map
			i = 0
			for y in xrange(h):
				for x in xrange(w):
					if (x,y) == (x0,y0):
						# show current location
						print "O",
					else:
						try:
							# show island label if available
							_id = findIslands.pixelToIslandId[i]
							ids.add(_id)
							print idChr(_id),
						except KeyError:
							# just display character if no island info available
							print space[i],
					i += 1
				print

			# print 
			print "island -> parent -> global owner"
			for _id in ids:
				print "%s -> %s -> %s" % (
					idChr(_id),
					idChr(findIslands.islandIdToParent[_id]._id),
					idChr(findIslands.getIslandOwner(_id)._id))

		expectedIslands = [
			IslandBounds(minx=3,maxx=10,miny=0,maxy=3),
			IslandBounds(minx=0,maxx=2, miny=2,maxy=6),
			IslandBounds(minx=8,maxx=12,miny=2,maxy=6),
		]
		actualIslands = findIslands(w,h,pixelIter)
		self.assertEqual(len(actualIslands), len(expectedIslands))

		actualStrs = set(map(str,actualIslands))
		expectedStrs = set(map(str,expectedIslands))
		self.assertSetEqual(actualStrs, expectedStrs)

	def test_merge(self):
		w,h = 13,7
		space = (
			# 0 1 2 3 4 5 6 7 8 9 0 1 2
			" . . . . . . # # # . . . . " + # 0
			" . . # # . . . # # . . . . " + # 1
			" . . # # # # . . . . . . . " + # 2
			" . . # . . . . . . . . . . " + # 3
			" . . # . # # # . . . . . . " + # 4
			" . . # . # # # . . . . . . " + # 5
			" . . . . . . . . . . . . . " + # 6
			"").split()

		def pixelIter():
			"""
			A row-major order iterator of our test-space.
			"""
			x,y,i = 0,0,0
			for i,c in enumerate(space):
				x = i % w
				y = i / w
				isSolid = (c=='#')
				yield x,y,i,isSolid

		actualIslands = findIslands(w,h,pixelIter)
		print len(actualIslands)

		mergedIslands = findIslands.minimalAreaMerge()
		print len(mergedIslands)

if __name__ == "__main__":
	unittest.main()
