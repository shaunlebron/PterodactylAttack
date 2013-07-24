#!/bin/sh

orig_dark='rgba(183,58,52,1.000)'
orig_light='rgba(206,52,52,1.000)'
orig_dark1='rgb(183,58,52)'
orig_light1='rgb(206,52,52)'

function makeColors {
	folder=$1
	dark=$2
	light=$3
	rm -rf $folder
	cp -r adult $folder
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

makeColors adult_mountain_red '#892427' '#B12432'
makeColors adult_mountain_green '#24894B' '#24B151'

makeColors adult_ice_red '#A52E51' '#D13169'
makeColors adult_ice_green '#2D8C6F' '#2FB582'

makeColors adult_volcano_blue '#137992' '#1AA4BB'
makeColors adult_volcano_orange '#BC660E' '#DC6A0B'
