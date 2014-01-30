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

# Main Files

src/main.js         : the game starts here by initializing everything
src/assets.js       : lists loadable assets, how to load them, and what to do with them when loaded
src/input.js        : input manager for touch/mouse events
src/audio.js        : soundfx/song operations
src/settings.js     : data persistence for things that need to be saved

# Timing/Scheduling

src/executive.js        : the heartbeat of the engine (determines what to do at every frame)
src/timed_script.js     : class for executing a timed script of events
src/time.js             : stopwatch and timer classes

# Screen/Coordinates

src/screen.js       : manages screen size and camera panning/zooming
src/frustum.js      : represents 3D frustum space for the game

# Image-drawing

src/sprites.js      : classes for different types of supported sprites (fonts, vectors, tables, mosaics)
src/billboard.js    : handles math for drawing front-facing images in 3D space
src/painter.js      : drawing functions that take 3D coordinates
src/button.js       : clickable button class for interace

# Background Environments

src/background.js
src/collision.js

# Orb-Shooting

src/orb.js
src/bullet.js
src/bulletpool.js
src/bounty.js

# Trajectory

src/vector.js
src/path.js
src/interp.js

# Playing

src/scene_play.js
src/pause_menu.js
src/overlord.js
src/player.js
src/enemy.js
src/score.js

# Other Scenes

src/scene_controlcenter.js
src/scene_credits.js
src/scene_erasehighscore.js
src/scene_gameover.js
src/scene_highscore.js
src/scene_loading.js
src/scene_menu.js
src/scene_options.js
src/scene_thanks.js
src/scene_title.js

# Misc

src/inherit.js          : allows an object to inherit from parent object
src/jsonData.js         : auto-generated (see genJsonData.py)
src/vectorPathData.js   : auto-generated (see genVectorPathData.py)
```

#### Tool Code Files

```
# Ptalaga
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

# Fourier
src/fourier/LivePane.js
src/fourier/TimePane.js
src/fourier/executive.js
src/fourier/loader.js
src/fourier/main.js
src/fourier/panes.js
src/fourier/scene_fourier.js
src/fourier/screen.js
src/fourier/wave.js

# Baklava
src/baklava/LivePane.js
src/baklava/Pane.js
src/baklava/executive.js
src/baklava/loader.js
src/baklava/main.js
src/baklava/model.js
src/baklava/panes.js
src/baklava/scene_parallax.js
src/baklava/screen.js

# Pinboard
src/pinboard/executive.js
src/pinboard/loader.js
src/pinboard/main.js
src/pinboard/scene_pinboard.js
src/pinboard/screen.js
```

## Adding Images

## Adding Images for use in Pinboard tool

## Creating new background environments


