#!/bin/sh

git log --date=raw | grep "^Date:" | awk 'BEGIN { print "{";i=0} i>0 { print ","} { i++; printf "\"%s\":1", $2} END { print "}"}' > commit-timestamps.json
