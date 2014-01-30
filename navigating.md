# Navigating the repository

## Directory Tree

### Top-Level Subdirectories

```
audio/          : audio assets
bg/             : background assets for each environment
fonts/          : font assets
hub/            : files used by the hub page
img/            : image assets
layout/         : layout assets
lib/            : javascript dependencies
packer/         : tool for packing bitmap textures (e.g. mosaics)
parallax/       : stripped down version of engine for parallax effect at hygoon.com
paths/          : pterodactyl paths
src/            : source code for game, engine, tools
svg2canvas/     : tool for converting svg to canvas paths
swf/            : SWF assets for pterodactyl animations
```

### Build Scripts

```
build.py                        : builds the game to reflect changes (outputs cocoon.js, cocoon.zip)
build_remote.py                 : builds the game remote to reflect changes (outputs remote.js, remote.zip)
                                  (the "remote" is the phone controller for the browser)

genJsonData.py                  : dumps JSON files into a js script (because CocoonJS does not like to load many JSON files)
genVectorPathData.py            : creates js script for drawing vector paths

genParallaxJsonData.py          : (same as "genJsonData.py", but stripped down for the parallax scroll for hygoon.com)
genParallaxVectorPathData.py    : (same as "getVectorPathData.py", but stripped down for the parallax scroll for hygoon.com)
```

### Web Pages

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

### NodeJS Server

```
server.js       : facilitates page hosting and file operations for the tools
package.json    : holds library dependencies for server.js
```

### Source Code

#### Directories

```
src/*           : source code for game and core engine
src/baklava/*   : source code for background environment tool
src/fourier/*   : source code for orchestrating pterodactyl paths into level files
src/pinboard/*  : source code for creating hud/menu layouts
src/ptalaga/*   : source code for creating pterodactyl paths
src/remote/*    : source code for phone remote for browser control
```

#### Game/Engine Code Files

```
src/ptero.js    : defines the "Ptero" namespace that contains everything in the game.

MAIN FILES
src/main.js         : the game starts here by initializing everything
src/assets.js       : lists loadable assets, how to load them, and what to do with them when loaded
src/input.js        : input manager for touch/mouse events
src/audio.js        : soundfx/song operations
src/settings.js     : data persistence for things that need to be saved

TIMING/SCHEDULING
src/executive.js        : the heartbeat of the engine (determines what to do at every frame)
src/timed_script.js     : class for executing a timed script of events
src/time.js             : stopwatch and timer classes

SCREEN/COORDINATES
src/screen.js       : manages screen size and camera panning/zooming
src/frustum.js      : represents 3D frustum space for the game

IMAGE-DRAWING
src/sprites.js      : classes for different types of supported sprites (fonts, vectors, tables, mosaics)
src/billboard.js    : handles math for drawing front-facing images in 3D space
src/painter.js      : drawing functions that take 3D coordinates
src/button.js       : clickable button class for interace

BACKGROUND ENVIRONMENTS
src/background.js   : manages each background environment
src/collision.js    : class for collision shape checks used by background layers

ORB-SHOOTING
src/orb.js          : manages firing of orb
src/bullet.js       : class for orb projectile bullet
src/bulletpool.js   : bullet manager
src/bounty.js       : class for managing the state of the orb's capture bounty

TRAJECTORY
src/vector.js       : class for representing a point in 3D space, with arithmetic operations
src/path.js         : classes for managing the state along a path or interpolation
src/interp.js       : math functions for generating interpolations

PLAYING
src/scene_play.js       : main scene for playing the game
src/pause_menu.js       : manages the state of the pause menu
src/overlord.js         : manages the pterodactyl attack timings and patterns
src/player.js           : manages the health of the player
src/enemy.js            : class for representing a pterodactyl flying at you
src/score.js            : manages the score and other related stats

OTHER SCENES
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

MISC
src/inherit.js          : allows an object to inherit from parent object
src/jsonData.js         : auto-generated (see genJsonData.py)
src/vectorPathData.js   : auto-generated (see genVectorPathData.py)
```

#### Tool Code Files

```
PTALAGA
src/ptalaga/LivePane.js
src/ptalaga/Pane.js
src/ptalaga/RotationPane.js
src/ptalaga/TimePane.js
src/ptalaga/enemy_model.js
src/ptalaga/executive.js
src/ptalaga/loader.js
src/ptalaga/main.js
src/ptalaga/panes.js
src/ptalaga/scene_crater.js
src/ptalaga/screen.js

FOURIER
src/fourier/LivePane.js
src/fourier/TimePane.js
src/fourier/executive.js
src/fourier/loader.js
src/fourier/main.js
src/fourier/panes.js
src/fourier/scene_fourier.js
src/fourier/screen.js
src/fourier/wave.js

BAKLAVA
src/baklava/LivePane.js
src/baklava/Pane.js
src/baklava/executive.js
src/baklava/loader.js
src/baklava/main.js
src/baklava/model.js
src/baklava/panes.js
src/baklava/scene_parallax.js
src/baklava/screen.js

PINBOARD
src/pinboard/executive.js
src/pinboard/loader.js
src/pinboard/main.js
src/pinboard/scene_pinboard.js
src/pinboard/screen.js
```

## Adding Images

## Adding Images for use in Pinboard tool

## Creating new background environments


