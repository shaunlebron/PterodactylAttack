#!/usr/bin/python

import json
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
				path = m.group(1)
				if not 'jquery' in path:
					includes.append(path)
	return includes

# Concatenate files into a single file (unix cat util)
def cat(in_names,out_name):
	destination = open(out_name,'wb')
	for filename in in_names:
		shutil.copyfileobj(open(filename,'rb'), destination)
	destination.close()

def closure(in_names, out_name):
	args = ['java','-jar','compiler.jar']
	for i in in_names:
		args.extend(['--js',i])
	args.extend(['--js_output_file',out_name])
	args.extend(['--language_in','ECMASCRIPT5'])
	subprocess.call(args)

def build_json_data():
	data = json.load(open('jsonData.json'))
	fname = "ptero_paths.json"
	data[fname] = json.load(open(fname))
	s = "Ptero.jsonData = " + json.dumps(data,indent=4) + ";"
	with open('jsonData.js','w') as f:
		f.write(s)

if __name__ == "__main__":

	print "Building json data..."
	build_json_data()

	output_name = 'ptero-parallax.js'
	print "Creating", output_name, " ..."
	includes = get_all_js_includes("index.html")
	for i in includes:
		print "   " + i
	cat(includes, output_name)

	output_name = 'ptero-parallax.min.js'
	print "Compiling", output_name, " ..."
	closure(includes, output_name)

	print "done."
