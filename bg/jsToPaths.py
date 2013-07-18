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

footer = """	];
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
		for word in ("save","font"):
			if word in line:
				return True
		return False

	lines = []
	with open(filename) as f:
		for line in f:
			lines.extend(line.replace(";",";\n").split('\n'))

	print header

	begin = False
	after_restore = False

	def print_func_line(line):
		print ("\t"*3)+line

	strokeStyle = None
	fillStyle = None
	isFill = False
	isStroke = False

	def close_block():
		if isFill:
			if not fillStyle:
				print_func_line('ctx.fillStyle="#000";')
		else:
			print_func_line('ctx.fillStyle="rgba(0,0,0,0)";')
		if not strokeStyle:
			print_func_line('ctx.strokeStyle="rgba(0,0,0,0)";')

	inGradient = False
	for line in lines:
		sline = line.strip()
		if not line or line==';':
			continue
		if "createLinearGradient" in line:
			begin = True
			line = line.replace("_gm=","var _gm=")
			inGradient = True
		elif inGradient:
			if "fillStyle" in line:
				fillStyle = line
				continue
			elif "_gm" in line:
				print_func_line(line)
				continue
			else:
				print_func_line(fillStyle)
				inGradient = False


		if "fillStyle" in line:
			begin = True

		if not begin:
			continue

		if invalid_line(line):
			continue

		if line.startswith("_gm=_pattern=_img=null;"):
			break

		if "restore" in line:
			after_restore = True
		else:
			if after_restore:
				close_block()
				strokeStyle = None
				fillStyle = None
				isFill = False
				isStroke = False
				print ("\t"*2) + "},"
				print ("\t"*2) + "function(ctx) {"

			after_restore = False

			if "fillStyle" in line:
				fillStyle = line
			elif "strokeStyle" in line:
				strokeStyle = line
			elif "stroke()" in line:
				isStroke = line
				continue
			elif "fill()" in line:
				isFill = line
				continue

			print_func_line(line)

	if after_restore:
		close_block()
		print ("\t"*2) + "},"

	print footer
