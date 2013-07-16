#!/usr/bin/env python

import sys

usage = """

indent.py <filename>

Indent the given JS file to show the structure of context save/restore instances.

"""

if __name__ == "__main__":
	args = sys.argv[1:]
	if len(args) < 1:
		print usage
		sys.exit(1)

	filename = args[0]
	
	level = 0
	def print_line(line):
		print ("\t"*level) + line
	with open(filename) as f:
		for line in f:
			line = line.strip()
			if line.startswith("ctx.save()"):
				print_line(line + "// [")
				level += 1
			elif line.startswith("ctx.restore()"):
				level -= 1
				print_line(line + "// ]")
			else:
				print_line(line)
