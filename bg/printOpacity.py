#!/usr/bin/env python

import sys
import re

usage = """

./printOpacity.py <svg file>

This tool prints the RGBA color by combining fill and opacity fields of shapes found in svg.

"""

if __name__ == "__main__":

	args = sys.argv[1:]

	if len(args) != 1:
		print usage
		sys.exit(1)

	svg_filename = args[0]

	opacity_pattern = re.compile(r'opacity="([0-9\.]+)"')
	fill_pattern = re.compile(r'fill="#([0-9A-Fa-f]{6})"')

	data = set()
	opacity = None
	fill = None
	with open(svg_filename) as f:
		for line in f:
			m1 = opacity_pattern.search(line)
			if m1:
				opacity = m1.group(1)
			m2 = fill_pattern.search(line)
			if m2:
				fill = m2.group(1)
			if m1 and m2:
				data.add((opacity,fill))
			elif m1:
				data.add((opacity,"000000"))
	
	for opacity,fill in data:
		r = int(fill[0:2], 16)
		g = int(fill[2:4], 16)
		b = int(fill[4:6], 16)
		print ("#" + fill), "rgba(%d,%d,%d,%s)" % (r,g,b,opacity)
