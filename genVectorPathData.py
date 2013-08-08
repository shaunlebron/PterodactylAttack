#!/usr/bin/env python

import sys
import os
import fnmatch
import re

def main():

	print "Ptero.vectorPathData = {"
	for folder in ('bg', 'swf'):
		for root, dirnames, filenames in os.walk(folder):
			for filename in fnmatch.filter(filenames, '*.svg.js'):

				keyname = ""
				if folder == 'bg':
					keyname += 'bg_'
				keyname += os.path.basename(root) + '_' + filename[:filename.index('.')]

				with open(os.path.join(root,filename)) as f:
					for line in f:
						if line.startswith('(function'):
							print '"%s": %s' % (keyname, line),
						elif line.startswith('})()'):
							print '})(),'
						else:
							print line,
	
	print "};"

if __name__ == "__main__":
	main()
