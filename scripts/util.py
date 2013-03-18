import png
import sys

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
			print "   index",index,"goes to",region["index"]
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
			print "merging to",r0["index"]
			for r in rs[1:]:
				r0["minx"] = min(r0["minx"], r["minx"])
				r0["maxx"] = max(r0["maxx"], r["maxx"])
				r0["miny"] = min(r0["miny"], r["miny"])
				r0["maxy"] = max(r0["maxy"], r["maxy"])
				regionLookup[r["index"]] = r0
				print "removing region index",r["index"]
				regions.remove(r)
			return r0

		#print "merging %s" % ",".join(str(x) for x in adj_indexes)
		return mergeRegions(adj_regions)

	def onSolidPixel(x,y,i):
		print x,y,i
		region = findAdjacentRegion(x,y)
		if region:
			print "   appending region to",region["index"]
			addPixelToRegion(x,y,i,region)
		else:
			region = makeNewRegion(x,y,i)
			print "   new region",region["index"]

	for x,y,i,r,g,b,a in iterPixels():
		if a > 0:
			onSolidPixel(x,y,i)

	return regions

def getAnimatedRegions(filenames):
	pass

if __name__ == "__main__":
	
	#regions = getCroppableRegions("../img/grass00.png")
	regions = getCroppableRegions("../img/boom1.png")
	print "regions = ["
	for r in regions:
		print r,","
	print "];"
