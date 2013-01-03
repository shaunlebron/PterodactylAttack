#!/usr/bin/python

import os
import zipfile
import shutil
import subprocess

# Concatenate files into a single file (unix cat util)
def cat(in_names,out_name):
	destination = open(out_name,'wb')
	for filename in in_names:
		shutil.copyfileobj(open(filename,'rb'), destination)
	destination.close()

# Create zip file.
def create_zip(in_names,out_name):
	archive = zipfile.ZipFile(out_name,'w')
	def addFile(filename):
		archive.write(filename)
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
	print "Creating cocoon.js ...",
	cat([
		"lib/requestAnimationFrame.js",
		"src/ptero.js",
		"src/assets.js",
		"src/background.js",
		"src/executive.js",
		"src/screen.js",
		"src/sprites.js",
		"src/stress/scene.js",
		"src/stress/enemy.js",
		"src/enemy.js",
		"src/frustum.js",
		"src/orb.js",
		"src/path.js",
		"src/paths.js",
		"src/scene_game.js",
		"src/time.js",
		"src/vector.js",
		"src/main.js",
	], 'cocoon.js')
	print "done."

	print "Creating cocoon.zip ...",
	create_zip(['cocoon.js','img'], 'cocoon.zip')
	print "done."

	print "Copying to android device ..."
	subprocess.call(["adb","push","cocoon.zip","/sdcard/"])
	print "done."
