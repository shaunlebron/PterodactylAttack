#!/bin/sh

cat lib/requestAnimationFrame.js \
	src/ptero.js \
	src/assets.js \
	src/background.js \
	src/executive.js \
	src/screen.js \
	src/sprites.js \
	src/stress/scene.js \
	src/stress/enemy.js \
	src/enemy.js \
	src/frustum.js \
	src/orb.js \
	src/path.js \
	src/paths.js \
	src/scene_game.js \
	src/time.js \
	src/vector.js \
	src/main.js > cocoon.js

zip cocoon.zip cocoon.js img/*

adb push cocoon.zip /sdcard/
