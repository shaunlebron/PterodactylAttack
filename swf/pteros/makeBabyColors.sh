#!/bin/sh

orig_dark='rgba(60,125,117,1.000)'
orig_light='rgba(128,193,185,1.000)'
orig_dark1='rgb(60,125,117)'
orig_light1='rgb(128,193,185)'

function makeColors {
	folder=$1
	dark=$2
	light=$3
	rm -rf $folder
	cp -r baby $folder
	cd $folder
	for f in *.js; do
		sed -i .bak "s/$orig_dark/$dark/" $f
		sed -i .bak "s/$orig_light/$light/" $f
	done
	for f in *.svg; do
		sed -i .bak "s/$orig_dark1/$dark/" $f
		sed -i .bak "s/$orig_light1/$light/" $f
	done
	rm *.bak
	rm *.py
	rm *.sh
	cd -
}

makeColors baby_white '#ffffff' '#ffffff'

makeColors baby_mountain_blue '#2A6598' '#7EBBED'
makeColors baby_mountain_purple '#6E179E' '#BF56F6'

makeColors baby_ice_purple '#6D1AA8' '#BF6EFD'
makeColors baby_ice_yellow '#8C6B12' '#E8C358'

makeColors baby_volcano_green '#1A8037' '#60DD84'
makeColors baby_volcano_purple '#403277' '#9887DB'
