#!/usr/bin/env python

import sys

usage = """

extractSvgLayers.py <svg file>

Given an SVG file, extract the top level groups into individual two-digit numbered layers (e.g. 00.svg, 01.svg, 02.svg)

"""

if __name__ == "__main__":

	args = sys.argv[1:]

	if len(args) != 1:
		print usage
		sys.exit(1)

	filename = args[0]
	
	header = ""
	gatheringHeader = True

	num = 0
	fileText = None

	with open(filename) as f:
		for line in f:

			# Reached the end of a new top-level group.
			if line.startswith('</g'):
				
				# write group text to file
				filename2 = '%02d.svg' % num
				with open(filename2, 'w') as f2:
					f2.write(fileText+"</svg>")
				print filename2

				# increment to next numbered file
				num += 1

			# Reached the start of a new top-level group.
			if line.startswith('<g'):

				# Stop gathering the header
				gatheringHeader = False

				# Initialize this group to the header and this current line
				fileText = header + line

			elif gatheringHeader:

				# keep building the header
				header += line

			else:

				# add current line to current group text
				fileText += line

