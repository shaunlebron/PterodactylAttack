# Technical Hurdles

There were a lot of unforeseen technical hurdles that had to be overcome while
developing Pterodactyl Attack.  It is good to be aware of these problems
because they ultimately influenced the design of the engine.  You must
certainly take heed on them if you want to make some additions/modifications.

## The main problem

The common denominator for all of these problems was that I was __trying to do
things that aren't normally done in HTML5/Canvas2D__.  And when you're entering
uncharted territory, there will be hard problems that not many people will be
able or willing to help you with.

CocoonJS is great, and I love the initiative, features and support from Ludei.
But it's closed-source, a __black box that you can't study__ to help problem
diagnosis and contribute fixes.  The devsupport team was responsive in fixing
problems, but only in the critical areas that were relevant to the framework's
common usages.  They were clearly busy with higher priority features, so I was
S.O.L. otherwise.

## Parallax Background Layers

The environment backgrounds we wanted in the game consisted of multiple large
layers that moved independently to create a parallax effect and to allow the
pterodactyls to move between them.

Using several near-fullscreen bitmaps for the layers was impossible.  Overdraw
would slow the framerate to a crawl, and there wouldn't be enough memory to
hold the high resolution textures.

This necessitated the use of vector layers.

## Pterodactyl/Explosion

The pterodactyls fly toward the screen, so we wanted them to __look sharp when
they were close up__.  When they exploded, we wanted the explosion to look sharp
as well.

There were several colors of pterodactyls, and so __every image had to
be duplicated for every color__.  This would've been a simple tinting shader operation,
but Canvas2D has no such features.

To help fix this problem, I used vector frames for the pterodactyls, which used
less memory, and had better close-up quality.  For the explosions, I just
created a sprite packer and kept them as bitmaps since they weren't seen as
often as the pterodactyls in-game.

## Vector Conversion Difficulty

Creating a pipeline for getting vector images into the game was a bit of a
nightmare.  What resulted was a slew of propietary tools for converting
the vector images into different formats supported by the browser and CocoonJS.

## Vector-rendering deficiencies

- no anti-aliasing on CocoonJS (intolerably ugly on non-retina screens)
- translucency blending was wrong on CocoonJS
- no SVG support on CocoonJS
- Firefox couldn't draw large SVG's efficiently like webkit could
- caused hiccups in framerate when drawn first time on CocoonJS

## Memory-related crashes

- couldn't measure how much memory vector images were using
- loading too many files crashed game
- had to create weird ways to compress vector functions
- had to dump all JSON files into a single JS file

## Android device fragmentation

- difficult to test across the fragmented Android space
- Crashes on some phones
- slow input lagging and buffering

## iOS7 swipe interference

A few weeks prior to finishing our game, iOS7 was released which broke the core
input mechanic of our game.  Swiping from the bottom of the screen now became
an OS function which brought up something called the Control Center.  This
disrupts the swipe motions that the players are expected to perform while
shooting.  We had to inform users to disable the Control Center to prevent
this.
