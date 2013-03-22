import unittest

from recpack import *

class TestRectanglePacker(unittest.TestCase):

	def test_first(self):
		class Rect:
			def __init__(self,name,w,h):
				self.name = name
				self.w = w
				self.h = h

		a = Rect('a',3,2)
		b = Rect('b',5,6)
		c = Rect('c',6,3)
		d = Rect('d',3,2)
		e = Rect('e',1,1)
		f = Rect('f',5,1)
		g = Rect('g',6,4)
		h = Rect('h',2,3)
		rects = (a,b,c,d,e,f,g,h)

		w = 20
		h = 10
		packer = RectanglePacker(w,h)

		canvas = ['.']*w*h
		def paintToCanvas(rect,x,y):
			for y0 in xrange(y,y+rect.h):
				for x0 in xrange(x,x+rect.w):
					if (0 <= x0 and x0 < w and
						0 <= y0 and y0 < h):
						canvas[x0+y0*w] = rect.name
					else:
						raise ValueError("invalid xy range %d, %d" % (x0,y0))

		def drawPacker():

			# get the positions of the dividers
			xs = [0]
			for w0 in packer.colWidths:
				xs.append(xs[-1]+w0)
			xs = set(xs)
			ys = [0]
			for h0 in packer.rowHeights:
				ys.append(ys[-1]+h0)
			ys = set(ys)

			# print horizontal rule
			def hr():
				print "    "+"-"*((w+len(xs))*2-1)

			# Print column numbers
			i = 0
			print
			print "     ",
			for x in xrange(w):
				if x in xs:
					print "%d"%i,
					i += 1
				print " ",
			print

			i = 0
			for y in xrange(h):
				if y in ys:
					hr()
				print "%3d" % y,
				for x in xrange(w):
					if x in xs:
						print "|",
					print canvas[i],
					i += 1
				print "|"
			hr()

		for r in rects:
			result = packer.insert(r.w,r.h)
			if result:
				x,y = result
				paintToCanvas(r,x,y)
			else:
				raise Exception("unable to place %s", r.name)
			drawPacker()

if __name__ == "__main__":
	unittest.main()
