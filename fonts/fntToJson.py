#!/usr/bin/env python
import sys
import json
import re

usage = """

fntToJson.py <fnt file>

Converts an exported Glyph Designer file into a json file for use in Pterodactyl Attack.

"""

def convert(filename):

	def getValue(sourceStr, key):
		m = re.search(key+r'=(\d+)', sourceStr)
		if not m:
			return None
		return int(m.group(1))
	
	chars = {}
	obj = {
		"font": True,
		"chars": chars,
	}
	def addLine(line):
		name = chr(getValue(line, 'id'))
		chars[name] = {
			"x": getValue(line, 'x'),
			"y": getValue(line, 'y'),
			"width": getValue(line, 'width'),
			"height": getValue(line, 'height'),
			"xoffset": getValue(line, 'xoffset'),
			"yoffset": getValue(line, 'yoffset'),
			"xadvance": getValue(line, 'xadvance'),
		}

	with open(filename) as f:
		for line in f:
			if line.startswith('char id'):
				addLine(line)
	
	print json.dumps(obj, indent=4)

if __name__ == "__main__":
	args = sys.argv[1:]
	if len(args) != 1:
		print usage
		sys.exit(1)
	
	filename = args[0]
	convert(filename)
