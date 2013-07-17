#!/bin/sh

for i in $(seq 0 8)
do
	./jsToPaths.py $i.js > $i.svg.js
done
