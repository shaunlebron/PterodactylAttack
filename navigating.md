# Navigating the repository

Describing something that took me a year to build is quite daunting.  I believe
it is probably something that could take me another a year to fully write about
and illustrate.  In the interest of time, here's what I've done instead.

I have opted to just write about and illustrate the high-level design and
technical aspects in the [aforementioned "book"](http://pteroattack.com/#quick-look)
I wrote.  And here I will leave you with a description of our directory tree
with a description of each file and a list of common tasks that you will need
to perform if adding assets.

## Directory Tree

### TOP-LEVEL

__subdirectories__
```
audio/          : audio assets
bg/             : background assets for each environment
fonts/          : font assets
hub/            : files used by the hub page
img/            : image assets
layout/         : layout assets (HUD/menu layouts created with Pinboard tool)
lib/            : javascript dependencies
packer/         : tool for packing bitmap textures (e.g. mosaics)
parallax/       : stripped down version of engine for parallax effect at hygoon.com
paths/          : pterodactyl paths (created with Ptalaga tool)
src/            : source code for game, engine, tools
svg2canvas/     : tool for converting svg to canvas paths
swf/            : SWF assets for pterodactyl animations
```

__build scripts__
```
build.py                        : builds the game to reflect changes (outputs cocoon.js, cocoon.zip)
build_remote.py                 : builds the game remote to reflect changes (outputs remote.js, remote.zip)
                                  (the "remote" is the phone controller for the browser)

genJsonData.py                  : dumps JSON files into a js script (because CocoonJS does not like to load many JSON files)
genVectorPathData.py            : creates js script for drawing vector paths

genParallaxJsonData.py          : (same as "genJsonData.py", but stripped down for the parallax scroll for hygoon.com)
genParallaxVectorPathData.py    : (same as "getVectorPathData.py", but stripped down for the parallax scroll for hygoon.com)
```

__web pages__
```
index.html      : hub (displays links to the game and tools)
play.html       : game
ptalaga.html    : tool for creating pterodactyl paths
fourier.html    : tool for coordinating multiple pterodactyl paths
baklava.html    : tool for managing environment backgrounds
pinboard.html   : tool for creating menu/hud layouts
remote.html     : remote controller (for controlling browser with phone)

visualize_waves.html : tool for visualizing wave patterns for each level
```

__nodejs server__
```
server.js       : facilitates page hosting and file operations for the tools
package.json    : holds library dependencies for server.js
```

### SOURCE CODE

__directories__
```
src/*           : source code for game and core engine
src/baklava/*   : source code for background environment tool
src/fourier/*   : source code for orchestrating pterodactyl paths into level files
src/pinboard/*  : source code for creating hud/menu layouts
src/ptalaga/*   : source code for creating pterodactyl paths
src/remote/*    : source code for phone remote for browser control
```

__main files__
```
src/main.js         : the game starts here by initializing everything
src/assets.js       : lists loadable assets, how to load them, and what to do with them when loaded
src/input.js        : input manager for touch/mouse events
src/audio.js        : soundfx/song operations
src/settings.js     : data persistence for things that need to be saved
```

__timing/scheduling__
```
src/executive.js        : the heartbeat of the engine (determines what to do at every frame)
src/timed_script.js     : class for executing a timed script of events
src/time.js             : stopwatch and timer classes
```

__screen/coordinates__
```
src/screen.js       : manages screen size and camera panning/zooming
src/frustum.js      : represents 3D frustum space for the game
```

__image-drawing__
```
src/sprites.js      : classes for different types of supported sprites (fonts, vectors, tables, mosaics)
src/billboard.js    : handles math for drawing front-facing images in 3D space
src/painter.js      : drawing functions that take 3D coordinates
src/button.js       : clickable button class for interace
```

__background environments__
```
src/background.js   : manages each background environment
src/collision.js    : class for collision shape checks used by background layers
```

__orb-shooting__
```
src/orb.js          : manages firing of orb
src/bullet.js       : class for orb projectile bullet
src/bulletpool.js   : bullet manager
src/bounty.js       : class for managing the state of the orb's capture bounty
```

__trajectory__
```
src/vector.js       : class for representing a point in 3D space, with arithmetic operations
src/path.js         : classes for managing the state along a path or interpolation
src/interp.js       : math functions for generating interpolations
```

__playing__
```
src/scene_play.js       : main scene for playing the game
src/pause_menu.js       : manages the state of the pause menu
src/overlord.js         : manages the pterodactyl attack timings and patterns
src/player.js           : manages the health of the player
src/enemy.js            : class for representing a pterodactyl flying at you
src/score.js            : manages the score and other related stats
```

__other scenes__
```
src/scene_loading.js            : the loading screen for the game while its loading assets
src/scene_title.js              : the falling title shown right after loading screen
src/scene_menu.js               : the main menu
src/scene_controlcenter.js      : suggests disabling iOS 7 Control Center
src/scene_options.js            : the options menu
src/scene_credits.js            : credit scroller
src/scene_thanks.js             : special thanks screen
src/scene_highscore.js          : displays the current high score and best stats
src/scene_erasehighscore.js     : prompt to confirm if you select to erase high scores
src/scene_gameover.js           : the game over screen shown when you die
```

__misc__
```
src/ptero.js            : defines the "Ptero" namespace that contains everything in the game.
src/inherit.js          : allows an object to inherit from parent object
src/jsonData.js         : auto-generated (see genJsonData.py)
src/vectorPathData.js   : auto-generated (see genVectorPathData.py)
```

__ptalaga__ (pterodactyl path tool)
```
src/ptalaga/main.js             : the tool starts here by initializing everything
src/ptalaga/executive.js        : the heartbeat of the tool (determines what to do at every frame)
src/ptalaga/loader.js           : persists the state of the tool with backup/resume, saving/loading
src/ptalaga/screen.js           : manages screen and pane sizes

src/ptalaga/panes.js            : manages layout, drawing and input for different panes
src/ptalaga/Pane.js             : class for orthographic perspective pane given two axes
src/ptalaga/LivePane.js         : class for the perspective preview pane
src/ptalaga/RotationPane.js     : class for the rotation control pane
src/ptalaga/TimePane.js         : class for the time control pane

src/ptalaga/scene_crater.js     : main scene
src/ptalaga/enemy_model.js      : manages the state of all the edit operations to the pterodactyls
```

__fourier__ (pterodactyl path orchestrator tool)
```
src/fourier/main.js             : the tool starts here by initializing everything
src/fourier/executive.js        : the heartbeat of the tool (determines what to do at every frame)
src/fourier/loader.js           : persists the state of the tool with backup/resume, saving/loading
src/fourier/screen.js           : manages screen and pane sizes

src/fourier/panes.js            : manages layout, drawing and input for different panes
src/fourier/LivePane.js         : class for the perspective preview pane
src/fourier/TimePane.js         : class for the time control pane

src/fourier/scene_fourier.js    : main scene
src/fourier/wave.js             : manages the state of all the edit operations to the waves
```

__baklava__ (background environment tool)
```
src/baklava/main.js             : the tool starts here by initializing everything
src/baklava/executive.js        : the heartbeat of the tool (determines what to do at every frame)
src/baklava/loader.js           : persists the state of the tool with backup/resume, saving/loading
src/baklava/screen.js           : manages screen and pane sizes

src/baklava/panes.js            : manages layout, drawing and input for different panes
src/baklava/Pane.js             : class for orthographic perspective pane given two axes
src/baklava/LivePane.js         : class for the perspective preview pane

src/baklava/scene_parallax.js   : main scene
src/baklava/model.js            : manages the state of all the edit operations to the background
```

__pinboard__ (menu/hud layout tool)
```
src/pinboard/main.js            : the tool starts here by initializing everything
src/pinboard/executive.js       : the heartbeat of the tool (determines what to do at every frame)
src/pinboard/loader.js          : persists the state of the tool with backup/resume, saving/loading
src/pinboard/screen.js          : manages screen and pane sizes

src/pinboard/scene_pinboard.js  : main scene and manages the state of all the edit operations to the layout
```

### ASSET SCRIPTS

__packer__ (sprite packing)
```
packer/packer.py            : main utility script for creating mosaics (see usage string inside)

packer/island.py            : an "island" is a contiguous region of opaque pixels
packer/recpack.py           : tries to pack given rectangles into smallest possible space

packer/test_island.py       : test the "island" functions
packer/test_recpack.py      : test the "recpack" functions

packer/png.py               : a library for reading/writing PNG images
packer/termcolor.py         : a library for coloring console output
```

__bg/&lt;asset&gt;/*__ (background assets)
```
bg/<asset>/                 : background files for <asset> (e.g. menu,tutorial,mountain)
bg/<asset>/<#>.svg          : SVG image for layer <#>
bg/<asset>/<#>.svg.json     : metadata for layer <#> (e.g. size, scale, type)
bg/<asset>/<#>.svg.js       : game-drawable JS Paths (canvas) for layer <#>
bg/<asset>/layers.json      : metadata for all layers (e.g. order, position, animation)
bg/<asset>/<#>.js           : first pass SVG->JS Paths conversion output for layer <#> (unused)

bg/menu             : main menu background assets
bg/tutorial         : tutorial background assets
bg/mountain         : mountain background assets
bg/ice              : ice background assets
bg/volcano          : volcano background assets
```

__bg/*__ (background utilities)
```
bg/notes            : some notes on conversion process

bg/extractSvgLayers.py      : split a given SVG file into numbered layers (see usage string inside)
bg/jsToPaths.py             : converts a "<#>.js" file into "<#>.svg.js" (game-usable path drawing functions)

bg/genPaths.sh              : performs bulk operations with "jsToPaths.py" (see usage string inside)
bg/genColorLayers.sh        : generates white & red colored versions of the background layers (used by tools)

bg/colorblend.py            : used by "genColorLayers.sh" for coloring layers (see usage string inside)
bg/printOpacity.py          : used for manually fixing layers with translucency (which CocoonJS hates) (see usage string)
```

__svg2canvas__ (SVG conversion and background creation utility)
```
index.html              : simple interface for converting SVG to JS Paths (canvas)
create_bg_layers.html   : (super utility) converts SVG file into layers and dumps them into a bg folder

svg2canvas.js           : a sane wrapper around "oss.canvg.min.js"

orig.html               : original web page that used "oss.canvg.min.js"
jquery.min.js           : jquery library required by "oss.canvg.min.js"
oss.canvg.min.js        : uglified and indiscernible script for convert svg to js paths (canvas)
```

__swf/pteros/*__ (SWF assets and scripts for pterodactyl animations)
```
swf/pteros/<asset>.swf              : original pterodactyl SWF animation (e.g. adult, baby)
swf/pteros/<asset>.html             : output of Google Swiffy conversion, modified to dump download links for SVG frames

swf/pteros/<asset>/                 : converted pterodactyl files for <asset>
swf/pteros/<asset>/<#>.svg          : SVG image for animation frame <#>
swf/pteros/<asset>/<#>.svg.json     : metadata for animation frame <#> (e.g. size, scale, type)
swf/pteros/<asset>/<#>.svg.js       : game-drawable JS Paths (canvas) for animation frame <#>

swf/pteros/<asset>_<bg>_<color>/    : pterodactyl <asset> recolored to <color> to match <bg>

swf/pteros/notes                    : notes on how to convert pterodactyl SWF animations to SVG

swf/pteros/stage_colors             : table of colors for original and recolored pterodactyls

swf/pteros/makeAdultColors.sh       : generates the "adult_<bg>_<color>/" folders from the "adult/" folder
swf/pteros/makeBabyColors.sh        : generates the "baby_<bg>_<color>/" folders from the "baby/" folder

swf/pteros/getSvgFrames.js          : used by "adult.html" and "baby.html" to dump SVG frames
swf/pteros/runtime.js               : Google Swiffy's runtime library for animating SWF as SVG
swf/pteros/tumble.html              : used to create side-by-side adult/baby anim for blog post
```

## Some common tasks

__Adding Images__

__Adding Images for use in Pinboard tool__

__Creating new background environments__

__Creating new pterodactyls__

