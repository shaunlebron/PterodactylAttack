#!/usr/bin/python

import os
import zipfile
import shutil
import subprocess
import re

def get_all_js_includes(filename):
	pattern = re.compile(r'\s*<script src="(.*)"></script>')
	includes = []
	with open(filename) as f:
		for line in f:
			m = pattern.match(line)
			if m:
				includes.append(m.group(1))
	return includes

# Concatenate files into a single file (unix cat util)
def cat(in_names,out_name):
	destination = open(out_name,'wb')
	for filename in in_names:
		shutil.copyfileobj(open(filename,'rb'), destination)
	destination.close()

def isIgnoredFile(filename):
	for ext in ('.GlyphProject','.html','.swf','.svg','.json','.py','.sh','.DS_Store','notes'):
		if filename.endswith(ext):
			return True

	if (filename.startswith('bg') or filename.startswith('swf')) and filename.endswith('.js'):
		return True

	return False

# Create zip file.
def create_zip(in_names,out_name):
	archive = zipfile.ZipFile(out_name,'w')
	def addFile(filename):
		if isIgnoredFile(filename):
			return
		archive.write(filename)
		print "   " + filename

	def addDir(dirname):
		for dirpath,subdirs,files in os.walk(dirname):
			for f in files:
				addFile(os.path.join(dirpath,f))
	for filename in in_names:
		if os.path.isdir(filename):
			addDir(filename)
		else:
			addFile(filename)
	archive.close()

if __name__ == "__main__":
	print "Generating vector path data script..."
	subprocess.call(["./genVectorPathData.py"], stdout=open('src/vectorPathData.js','w'))

	print "Generating json data script..."
	subprocess.call(["./genJsonData.py"], stdout=open('src/jsonData.js','w'))

	print "Creating cocoon.js ..."
	includes = get_all_js_includes("play.html")
	for i in includes:
		print "   " + i
	cat(includes, 'cocoon.js')
	print "done."


	print "Creating cocoon.zip ..."
	create_zip(['cocoon.js','layout','swf','bg','img','audio','levels','paths','fonts'], 'cocoon.zip')
	print "done."


	"""
	print "Copying to android device ..."
	try:
		subprocess.call(["adb","push","cocoon.zip","/sdcard/"])
	except:
		print "	ERROR: couldn't copy to android device"
	"""
