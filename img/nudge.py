#!/usr/bin/env python

import json
import sys

usage_str = """

%s meta_image_filename xnudge ynudge

Nudge all the tiles in the given meta data by the given nudges.

One nudge = One pixel!!!

"""

if __name__ == "__main__":

	args = sys.argv[1:]
	if len(args) == 3:
		filename = args[0]
		xnudge = int(args[1])
		ynudge = int(args[2])
	else:
		print usage_str
		sys.exit(1)
	
	with open(filename) as f:
		data = json.load(f)
		for img,imgdata in data["mosaic"].items():
			for tile in imgdata["tiles"]:
				tile["origX"] += xnudge
				tile["origY"] += ynudge
	
	with open(filename,"w") as f:
		json.dump(data,f,indent=4,sort_keys=True)
