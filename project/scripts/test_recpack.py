import random
import unittest
import termcolor

from recpack import *

class RecPackDbgCanvas:

	def __init__(self,packer):
		self.packer = packer
		self.w = packer.w
		self.h = packer.h
		self.canvas = ['.']*self.w*self.h

	def insert(self,rect,x,y):
		for y0 in xrange(y,y+rect.h):
			for x0 in xrange(x,x+rect.w):
				if (0 <= x0 and x0 < self.w and
					0 <= y0 and y0 < self.h):
					try:
						text = termcolor.colored(rect.name, rect.color)
					except AttributeError:
						text = rect.name
					self.canvas[x0+y0*self.w] = text
				else:
					raise ValueError("invalid xy range %d, %d" % (x0,y0))

	def display(self):
		w = self.w
		h = self.h

		# get the positions of the dividers
		xs = [0]
		for w0 in self.packer.colWidths:
			xs.append(xs[-1]+w0)
		xs = set(xs)
		ys = [0]
		for h0 in self.packer.rowHeights:
			ys.append(ys[-1]+h0)
		ys = set(ys)

		## PRINT THE PACKER PARTITIONS

		for row,cols in enumerate(self.packer.isFilled):

			# print column numbers
			if row == 0:
				print "  ",
				for col,filled in enumerate(cols):
					print col,
				print

			# print row with row number
			print "%2d"%row,
			for filled in cols:
				if filled:
					print "#",
				else:
					print ".",
			print

		## PRINT THE PARTITIONS WITH WHOLE CANVAS

		# print horizontal rule
		def hr():
			print "    "+"-"*((w+len(xs))*2-1)

		# Print column numbers
		col = 0
		print
		print "     ",
		for x in xrange(w):
			if x in xs:
				print "%d"%col,
				col += 1
			print " ",
		print

		i = 0
		row = 0
		for y in xrange(h):

			# print divider if on partition edge
			if y in ys:
				hr()
				print "%3d" % row,
				row += 1
			else:
				print "   ",

			# print row
			for x in xrange(w):
				if x in xs:
					print "|",
				print self.canvas[i],
				i += 1
			print "|"
		hr()

class Rect:
	def __init__(self,name,w,h):
		self.name = name
		self.w = w
		self.h = h

class TestRectanglePacker(unittest.TestCase):

	def test_first(self):

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
		canvas = RecPackDbgCanvas(packer)

		for r in rects:
			result = packer.insert(r.w,r.h)
			if result:
				x,y = result
				canvas.insert(r,x,y)
			else:
				raise Exception("unable to place %s", r.name)
			canvas.display()

	def test_optimal(self):

		a = Rect('a',3,2)
		b = Rect('b',5,6)
		c = Rect('c',6,3)
		d = Rect('d',3,2)
		e = Rect('e',1,1)
		f = Rect('f',5,1)
		g = Rect('g',6,4)
		h = Rect('h',2,3)
		rects = [a,b,c,d,e,f,g,h]
		rect_dict = dict((r.name,r) for r in rects)

		w,h,pos,packer = getOptimalRecPack(rects)

		canvas = RecPackDbgCanvas(packer)

		for name,(x,y) in pos.items():
			canvas.insert(rect_dict[name], x, y)
		canvas.display()

	def test_optimal_random(self):

		rects = []
		letters = "a b c d e f g".split()
		colors = "red green yellow blue magenta cyan white".split()
		for name,color in zip(letters,colors):
			w = random.randint(1,11)
			h = random.randint(1,11)
			r = Rect(name,w,h)
			r.color = color
			rects.append(r)
		rect_dict = dict((r.name,r) for r in rects)

		w,h,pos,packer = getOptimalRecPack(rects)

		canvas = RecPackDbgCanvas(packer)

		for name,(x,y) in pos.items():
			canvas.insert(rect_dict[name], x, y)
		canvas.display()

if __name__ == "__main__":
	unittest.main()
