# Pterodacyl Attack

![logo](http://www.hygoon.com/press/images/game-title.png)

[Pterodactyl Attack](http://pteroattack.com) is an iOS game made at [Hygoon
Studio](http://hygoon.com).  It was created in Javascript from the ground up
and can be played from the web browser as well as mobile devices via CocoonJS.

This repository is the entire source code for our development workflow (game,
tools, workspace, server, build scripts).  It also contains the entire history
of revisions from its early prototype on January 2013 to its current completed
stage on January 2014.

## The Book

![book](http://hygoon.com/wp-content/uploads/2013/08/blog_preview.png)

If you are interested in learning about the game, please see our comprehensive
guide that illustrates every aspect of our development in detail:
<http://pteroattack.com/#quick-look>

## Buying the Game

If you wish to play the game on iPhone or iPad, you can buy it here:

[![appstore](http://pteroattack.com/img/appstore.png)](https://itunes.apple.com/us/app/pterodactyl-attack/id786862892?mt=8&ign-mpt=uo%3D4)

## License

This program is free software: you can redistribute it and/or modify it under
the terms of the [__GNU General Public License Version 3__ as published by the Free
Software Foundation](http://www.gnu.org/licenses/gpl.html).

## Required Setup

This section covers how to setup the development workspace.  This will allow
you to start playing the game and messing with the tools and game source code,
and will allow you to run the game on your mobile devices as well.

### Installing Dependencies 

Download and install the following required programs:

- Get [Git](http://git-scm.com/downloads). This is used to "clone" this repository.  This downloads our current workspace and its entire history of revisions.
- Get [NodeJS](http://nodejs.org/download/) so you can run the server for the workspace.  This "serves" the local webpage for the game and tools and facilitates
the tool operations.

You can get these as well, but they are optional:

- Optionally, get a [Git GUI](http://git-scm.com/downloads/guis) if you prefer GUI interfaces over command lines.
- Optionally, get [Sublime Text](http://www.sublimetext.com/) if you want a nice text editor for navigating and editing the code.

### Retrieving the workspace

You can place the workspace anywhere you want on your computer.  Using Git from
the command prompt, you can type the following:

```
git clone https://github.com/shaunlebron/PterodactylAttack.git
```

OR if you are using a GUI, use the URL above as the source for your clone operation.

### Setting up NodeJS (for the server)

Using a command prompt, navigate to the repository that you cloned and type the following:

```
npm install
```

(This automatically creates a "node_modules" folder in the workspace and installs the NodeJS
modules there required by this project, listed in "package.json".)

### CocoonJS (for playing on mobile devices)

The game will run fine on a web browser, but if you want to test it on a mobile
device, you must register for a free account on
[CocoonJS](https://www.ludei.com/cocoonjs/).  Then you can install either of these
launcher applications (free) on your mobile devices:

- [CocoonJS Launcher for Android](https://play.google.com/store/apps/details?id=com.ideateca.cocoonjslauncher)
- [CocoonJS Launcher for iOS](https://itunes.apple.com/us/app/cocoonjs-by-ludei/id519623307?mt=8)

### You are all set!

You're ready to start playing with the game, code, and tools if you've completed all the setup above.

## Doing Things

Now that you're setup, you can start doing some things!

### Starting the server

Whenever you want to test the game or run the tools, the server must be running.  Navigate to the repository
on the command line, and type the following:

```
node server
```

This will run the server.  So you must keep it open when using the game/tools.
To Stop the server, hit CTRL+C or simply close the window.

### Playing the game and running the tools

To play the game or run the tools, simply open a web browser (preferably Chrome, but Safari and Firefox wil do), and navigate
to:

```
http://localhost:3001
```

This points your browser to the webpage served by the NodeJS server for the Pterodactyl Attack workspace.  You will see
a "hub" of links to the game and tools.
