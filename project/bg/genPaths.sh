#!/bin/sh

# Print usage
if [ -z $@ ]; then
	echo
	echo './genPaths.sh <all | n*>'
	echo
	echo 'Generate the cocoon-ready canvas paths from the raw JS paths for all of the given numbered files.'
	echo
	exit 1

# Generate all paths
elif [ $@ == 'all' ]; then
	max=0
	for i in $(seq 0 99); do
		j=$(printf '%02d' $i)
		[ -e $j.js ] || break
		max=$i
	done
	args=$(seq 0 $max)

# Use the given numbers
else
	args=$@
fi

for i in $args; do
	j=$(printf '%02d' $i)
	echo writing $j.svg.js
	./jsToPaths.py $j.js > $j.svg.js
done
