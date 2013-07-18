#!/bin/sh

if [ -z $@ ]; then
	args=$(seq 0 9)
else
	args=$@
fi

for i in $args; do
	j=$(printf '%02d' $i)
	./jsToPaths.py $j.js > $j.svg.js
done
