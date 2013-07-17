#!/usr/bin/env python

import sys

usage = """

jsToPaths.py <filename>

Takes a js file with a list of ctx commands from http://www.omnisoftsystems.com/?returnUrl=/iTrax/Home/svg2Canvas/0

Formats it into a list of paths for use in Cocoon.

"""

header = """
(function(){
	var paths = [
		function(ctx) {"""

footer = """		},
	];
	return {
		shapeCompatible: true,
		paths: paths,
	};
})();
"""

if __name__ == "__main__":
	args = sys.argv[1:]
	if len(args) < 1:
		print usage
		sys.exit(1)
	
	filename = args[0]

	def invalid_line(line):
		if not line.strip():
			return True
		for word in ("save","font","fill()","stroke()"):
			if word in line:
				return True
		return False

	lines = []
	with open(filename) as f:
		for line in f:
			lines.extend(line.replace(";",";\n").split('\n'))

	print header

	begin = False
	transform_line = None
	after_restore = False

	def print_func_line(line):
		print ("\t"*3)+line

	for line in lines:
		if "transform" in line:
			transform_line = line
			begin = True
		if not begin:
			continue
		if invalid_line(line):
			continue
		if line.startswith("_gm=_pattern=_img=null;"):
			break;

		if "restore" in line:
			after_restore = True
		else:
			if after_restore:
				print ("\t"*2) + "},"
				print ("\t"*2) + "function(ctx) {"
				if not "transform" in line:
					print_func_line(transform_line)
			print_func_line(line)
			after_restore = False

	print footer
