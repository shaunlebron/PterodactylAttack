#!/usr/bin/env python

import sys
import os
import re

usage = """

colorblend.py <svg file> <hex color> <blend factor 0-1>

outputs to STDOUT the given SVG file, but with all its colors blended with the given color/factor

"""

def rgb2hex(r,g,b):
	return '#%02X%02X%02X' % (r,g,b)

def hex2rgb(hexColor):
	return [
		int(hexColor[0:2], 16),
		int(hexColor[2:4], 16),
		int(hexColor[4:6], 16),
	]

if __name__ == "__main__":
	args = sys.argv[1:]
	if len(args) < 3:
		print usage
		sys.exit(1)

	filename,shade,blend = args

	blend = float(blend)

	r,g,b = hex2rgb(shade)

	def colorblend(matchobj):
		r0,g0,b0 = hex2rgb(matchobj.group(0)[1:])
		return rgb2hex(
			min(255, int(r0*(1-blend) + r*blend)),
			min(255, int(g0*(1-blend) + g*blend)),
			min(255, int(b0*(1-blend) + b*blend)))

	hex_pattern          = re.compile(r'#[0-9a-fA-F]{6}')
	path_pattern     = re.compile(r'<path')
	polyline_pattern = re.compile(r'<polyline')
	polygon_pattern  = re.compile(r'<polygon')
	fill_pattern = re.compile(r' fill=')
	
	with open(filename) as f:
		for line in f:
			if not fill_pattern.search(line):
				if path_pattern.search(line):
					line = re.sub('<path ', '<path fill="#000000" ', line)
				if polyline_pattern.search(line):
					line = re.sub('<polyline ', '<polyline fill="#000000" ', line)
				if polygon_pattern.search(line):
					line = re.sub('<polygon ', '<polygon fill="#000000" ', line)
			print hex_pattern.sub(colorblend, line),
