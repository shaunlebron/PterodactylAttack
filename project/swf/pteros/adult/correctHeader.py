#!/usr/bin/env python

import sys

usage = """

correctHeaders.py <svg filename>

Takes the SVG file output from Swiffy, and corrects the header by replacing the single <svg> start tag with a properly formated one allowing for displaying in browsers.

"""

header = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 30000 20000">
"""

if __name__ == "__main__":
	args = sys.argv[1:]

	if len(args) != 1:
		print usage
		sys.exit(1)
	
	filename = args[0]

	corrected_text = header

	begin = False
	with open(filename) as f:
		for line in f:
			if line.startswith('<svg'):
				begin = True
				continue
			if begin:
				corrected_text += line
	
	with open(filename,'w') as f:
		f.write(corrected_text)
