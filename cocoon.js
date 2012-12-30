// polyfill from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
            timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());

var Ptero = Ptero || {};

Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/Final_Desert.jpg",
		"baby": "img/baby_sheet.png",
		"boom1": "img/boom1_sheet.png",
		"boom2": "img/boom2_sheet.png",
	};

	var images = {};
	var sheets = {};

	var loadSpriteSheets = function() {
		var name,req,src;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				src = imageSources[name];
				if (! /_sheet/.test(src)) {
					continue;
				}
				src += ".json";

				req = new XMLHttpRequest();
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					var info = JSON.parse(req.responseText);
					sheets[name] = new Ptero.SpriteSheet(images[name], info);
				}
			}
		}
	};

	var load = function(callback) {
		var count = 0;
		var name;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				count++;
			}
		}

		var handleLoad = function() {
			count--;
			if (count == 0) {
				loadSpriteSheets();
				callback && callback();
			}
		};

		var img;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				img = new Image();
				img.src = imageSources[name];
				img.onload = handleLoad;
				images[name] = img;
			}
		}
	};

	return {
		load: load,
		images: images,
		sheets: sheets,
	};
})();

Ptero.background = (function(){

	var image;
	var scale;

	return {
		setImage: function(img) {
			image = img;
			var aspect = image.width / image.height;
			var scaleH = Ptero.screen.getHeight() / image.height;
			var scaleW = Ptero.screen.getWidth() / image.width;
			scale = (aspect > Ptero.screen.getAspect()) ? scaleH : scaleW;
		},
		draw: function(ctx) {
			var sx = 0;
			var sy = 0;
			var sw = image.width;
			var sh = image.height;
			var dw = sw * scale;
			var dh = sh * scale;
			var dx = Ptero.screen.getWidth()/2 - dw/2;
			var dy = Ptero.screen.getHeight()/2 - dh/2;
			ctx.drawImage(image, sx,sy,sw,sh, dx,dy,dw,dh);
		},
	};
})();
Ptero.setScene = function(scene) {
	Ptero.scene = scene;
	scene.init();
};

Ptero.executive = (function(){

	var lastTime;
	var minFps = 20;

    var fps;
    var updateFps = (function(){
        var length = 60;
        var times = [];
        var startIndex = 0;
        var endIndex = -1;
        var filled = false;

        return function(now) {
            if (filled) {
                startIndex = (startIndex+1) % length;
            }
            endIndex = (endIndex+1) % length;
            if (endIndex == length-1) {
                filled = true;
            }

            times[endIndex] = now;

            var seconds = (now - times[startIndex]) / 1000;
            var frames = endIndex - startIndex;
            if (frames < 0) {
                frames += length;
            }
            fps = frames / seconds;
        };
    })();
	var drawFps = function(ctx) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "#FFF";
		var pad = 5;
		var x = pad;
		var y = Ptero.screen.getHeight() - pad;
		ctx.fillText(Math.floor(fps)+" fps", x, y);
	};

	var tick = function(time) {
		updateFps(time);

		var dt = Math.min((time-lastTime)/1000, 1/minFps);
		lastTime = time;

		var scene = Ptero.scene;
		if (!isPaused) {
			scene.update(dt);
		}
		var ctx = Ptero.screen.getCtx();
		scene.draw(ctx);
		drawFps(ctx);
		requestAnimationFrame(tick);
	};

	var isPaused = false;
	var pause = function() {
		isPaused = true;
	};
	var resume = function() {
		isPaused = false;
	};

	var start = function() {
		lastTime = (new Date).getTime();
		requestAnimationFrame(tick);
	};

	return {
		start: start,
		pause: pause,
		resume: resume,
	};
})();
Ptero.screen = (function(){
	var width;
	var height;
	var aspect;
	var canvas,ctx;
	var frustum;

	var setSize = function(w,h) {
		width = w;
		height = h;
		aspect = width/height;
		canvas.width = width;
		canvas.height = height;
	};

	var init = function(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		if (navigator.isCocoonJS) {
			setSize(window.innerWidth, window.innerHeight);
		}
		else {
			setSize(720,480);
		}

		var fov = 30*Math.PI/180;
		var near = width/2 / Math.tan(fov/2);
		var far = near*7;
		frustum = new Ptero.Frustum(near,far,fov,aspect);

		Ptero.sizeFactor = frustum.nearTop;
	};

	// Determine screen coordinates from a point in the frustum.
	var spaceToScreen = function(x,y,z) {
		var v = frustum.projectToNear(x,y,z);
		return {
			x: (v.x/frustum.nearWidth + 0.5) * width,
			y: (-v.y/frustum.nearHeight + 0.5) * height,
		};
	};

	// Determine point on the frustum's near plane from a screen coordinate.
	var screenToSpace = function(x,y) {
		return {
			x: (x/width - 0.5) * frustum.nearWidth,
			y: -(y/height - 0.5) * frustum.nearHeight,
			z: frustum.near,
		};
	};

	return {
		init: init,
		getWidth:	function() { return width; },
		getHeight:  function() { return height; },
		getAspect:  function() { return aspect; },
		getCanvas:	function() { return canvas; },
		getCtx:		function() { return ctx; },
		getFrustum: function() { return frustum; },
		spaceToScreen: spaceToScreen,
		screenToSpace: screenToSpace,
	};
})();


Ptero.SpriteSheet = function(img,dict) {
	this.img = img;

	this.rows = dict.rows;
	this.cols = dict.cols;
	this.frames = dict.frames;
	this.fps = dict.fps;

	this.tileWidth = img.width / this.cols;
	this.tileHeight = img.height / this.rows;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	this.tileCenterX = this.tileWidth * dict.centerX;
	this.tileCenterY = this.tileHeight * dict.centerY;
};

Ptero.SpriteSheet.prototype = {
	draw: function(ctx,x,y,frame,scale) {
		if (scale == undefined) {
			scale = 1;
		}
		var row = Math.floor(frame / this.cols);
		var col = frame % this.cols;
		var sx = col * this.tileWidth;
		var sy = row * this.tileHeight;
		var sw = this.tileWidth;
		var sh = this.tileHeight;
		var dw = sw*scale;
		var dh = sh*scale;
		ctx.drawImage(this.img,
			sx,sy,sw,sh,
			x,y,dw,dh);
	},
	drawCentered: function(ctx,x,y,frame,scale) {
		x -= this.tileCenterX * scale;
		y -= this.tileCenterY * scale;
		this.draw(ctx,x,y,frame,scale);
	},
};

Ptero.AnimSprite = function(sheet) {
	this.sheet = sheet;

	this.frameDuration = 1/this.sheet.fps;
	this.totalDuration = this.frameDuration * sheet.frames;
	this.time = 0;
	this.frame = 0;

	this.animating = true;
	this.repeat = true;
};

Ptero.AnimSprite.prototype = {
	start: function() {
		this.animating = true;
	},
	restart: function() {
		this.reset();
		this.start();
	},
	stop: function() {
		this.animating = false;
	},
	reset: function() {
		this.time = 0;
	},
	setRepeat: function(on) {
		this.repeat = on;
	},
	setFinishCallback: function(callback) {
		this.onFinish = callback;
	},
	isDone: function() {
		return (this.time >= this.totalDuration);
	},
	update: function(dt) {
		if (!this.animating) {
			return;
		}

		this.time += dt;
		if (this.time >= this.totalDuration) {
			this.onFinish && this.onFinish();
			if (!this.repeat) {
				this.stop();
				return;
			}
		}

		this.time %= this.totalDuration;
		this.frame = Math.floor(this.time / this.frameDuration);
	},
	draw: function(ctx,x,y,scale) {
		this.sheet.draw(ctx,x,y,this.frame,scale);
	},
	drawCentered: function(ctx,x,y,scale) {
		this.sheet.drawCentered(ctx,x,y,this.frame,scale);
	},
};

Ptero.stress_scene = (function(){

	var babies = [];
	var numBabies = 30;

	var init = function() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
		for (i=0; i<numBabies; i++) {
			babies[i] = new Ptero.StressEnemy();
		}
	};

	var update = function(dt) {
		var i;
		for (i=0; i<numBabies; i++) {
			babies[i].update(dt);
		}
	};

	var draw = function(ctx) {
		Ptero.background.draw(ctx);
		var i;
		for (i=0; i<numBabies; i++) {
			babies[i].draw(ctx);
		}

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		var radius = 100;
		var x = Ptero.screen.getWidth()/2;
		var y = Ptero.screen.getHeight();
		ctx.arc(x,y,radius, 0, 2*Math.PI);
		ctx.fill();
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();

Ptero.StressEnemy = function() {
	this.scaleDir = 1;
	this.minScale = 0.01;
	this.maxScale = 0.8;
	this.scaleRange = (this.maxScale - this.minScale);
	this.scale = Math.random()*this.scaleRange + this.minScale;

	var screen_w = Ptero.screen.getWidth();
	var screen_h = Ptero.screen.getHeight();
	this.x = (Math.random()*screen_w);
	this.y = (Math.random()*screen_h);

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.babySprite.update(Math.random()*this.babySprite.totalDuration);

	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);

	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);

	this.randomizeBoom();

	this.alive = true;
	this.timeLeft = Math.random()*10;
};

Ptero.StressEnemy.prototype = {
	randomizeBoom: function() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
	},
	update: function(dt) {
		this.updateScale(dt);
		if (this.alive) {
			this.babySprite.update(dt);
		}
		else {
			this.boomSprite.update(dt);
		}

		this.timeLeft -= dt;
		if (this.timeLeft <= 0) {
			this.alive = !this.alive;
			if (this.alive) {
				this.timeLeft = Math.random()*10;
			}
			else {
				this.timeLeft = Infinity;
				this.randomizeBoom();
				this.boomSprite.start();
				this.boomSprite.reset();
				this.boomSprite.setFinishCallback((function(that){
					return function() {
						that.timeLeft = Math.random()*10;
					};
				})(this));
			}
		}
	},
	updateScale: function(dt) {
		this.scale += dt*0.25*this.scaleDir;
		if (this.scale > this.maxScale) {
			this.scale = this.maxScale;
			this.scaleDir *= -1;
		}
		else if (this.scale < this.minScale) {
			this.scale = this.minScale;
			this.scaleDir *= -1;
		}
	},
	draw: function(ctx) {
		if (this.alive) {
			this.babySprite.drawCentered(ctx,this.x,this.y,this.scale);
		}
		else {
			if (this.boomSprite.animating) {
				this.boomSprite.drawCentered(ctx,this.x,this.y,this.scale);
			}
		}
	},
};

Ptero.Enemy = function() {
	this.path = Ptero.makeEnemyPath();
	this.isHit = false;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.babySprite.update(Math.random()*this.babySprite.totalDuration);

	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);
	this.randomizeBoom();

	this.doneTimer = new Ptero.Timer(1000);

	this.setTimeBomb();
};

Ptero.Enemy.prototype = {
	setTimeBomb: function() {
		this.bombTimer = new Ptero.Timer((Math.random()*10 + 3)*1000);
	},
	randomizeBoom: function() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
		this.boomSprite.restart();
	},
	isHittable: function() {
		return !this.path.isDone() && !this.isHit; // only hittable if not already hit
	},
	getPosition: function() {
		return this.path.state.pos;
	},
	getCollisionRadius: function() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function(time) {
		return this.path.seek(time).pos;
	},
	onHit: function() {
		// update score
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		this.isHit = true;
		var that = this;
	},
	resetPosition: function() {
		this.randomizeBoom();
		this.path = Ptero.makeEnemyPath();
		this.isHit = false;
		this.doneTimer.reset();
		this.setTimeBomb();
	},
	update: function(dt) {
		var millis = dt*1000;

		// update position of quad object
		// quadObject.setPos(path.state.pos);

		if (this.isHit) {
			// BOOM
			this.boomSprite.update(dt);
			if (this.boomSprite.isDone()) {
				this.resetPosition();
			}
		}
		else if (this.path.isDone()) {
			// HIT SCREEN

			if (this.doneTimer.getElapsedMillis() == 0) {
				navigator.vibrate && navigator.vibrate(200);
				// Screen.shakeScreen(1000);
			}
			this.doneTimer.increment(millis);
			if (this.doneTimer.isDone()) {
				this.resetPosition();
			}
		}
		else {
			// FLYING TOWARD SCREEN
			this.bombTimer.increment(millis);
			if (this.bombTimer.isDone()) {
				this.onHit();
			}
			else {
				// update position
				this.path.step(dt);

				// update animation
				this.babySprite.update(dt);
			}
		}
	},
	draw: function(ctx) {
		var pos = this.path.state.pos;

		// this is the scale of the image when it is on the near plane.
		var screenWidth = this.boomSprite.sheet.tileWidth;

		// this is the apparent scale resulting from its depth.
		var scale = Ptero.screen.getFrustum().getDepthScale(pos.z, screenWidth) / screenWidth;

		var screenPos = Ptero.screen.spaceToScreen(pos.x, pos.y, pos.z);

		if (this.isHit) {
			this.boomSprite.drawCentered(ctx, screenPos.x, screenPos.y, scale);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.drawCentered(ctx, screenPos.x, screenPos.y, scale);
		}
	},
};
// Viewing Frustum for 3D projection.
// coordinate system is OpenGL with z reversed:
//		 +x = right
//		 +y = up
//		 +z = out (from your eye to the screen)
// fov is vertical field of view.
// near and far planes are in z coordinates.
Ptero.Frustum = function(near,far,fov,aspect) {
	this.near = near;
	this.far = far;
	this.fov = fov;
	this.aspect = aspect;

	this.nearTop = Math.tan(fov/2)*near;
	this.nearRight = this.nearTop * aspect;

	this.nearWidth = this.nearRight * 2;
	this.nearHeight = this.nearTop * 2;
};

Ptero.Frustum.prototype = {
	projectToZ: function(x,y,z,newz) {
		return {
			x: x/z*newz,
			y: y/z*newz,
		};
	},
	projectToNear: function(x,y,z) {
		return this.projectToZ(x,y,z,this.near);
	},
	isInside: function(x,y,z) {
		var v = this.projectToNear(x,y,z);
		return (far < z && z < near && // ( far < z < near)
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function(z,nearScale) {
		return nearScale/z*this.near;
	},
};
Ptero.orb = (function(){

	var rAspect = 1/2*0.8; // radius multipler on half of screen height

	var draw = function(ctx) {
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		var radius = Ptero.screen.getHeight()/2 * rAspect;
		var x = Ptero.screen.getWidth()/2;
		var y = Ptero.screen.getHeight();
		ctx.arc(x,y,radius, 0, 2*Math.PI);
		ctx.fill();
	};

	return {
		draw: draw,
	};
})();
Ptero.PathState = function(index,indexStep,time,pos) {
	if (index == undefined) index = 0;
	if (indexStep == undefined) indexStep = 1;
	if (time == undefined) time = 0;
	if (pos == undefined) pos = {};
	this.index = index;
	this.indexStep = indexStep;
	this.time = time;
	this.pos = pos;
};

Ptero.Path = function(points, times, loop) {
	this.points = points;
	this.times = times;
	this.state = new Ptero.PathState;
	this.loop = loop;
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function(dt) {

		var i = this.state.index;
		var iStep = this.state.indexStep;
		var t = this.state.time+dt;
		var p = new Ptero.Vector;

		while (true) {

			if (this.loop) {
				// change direction if at ends
				if (i == this.points.length-1) {
					if (iStep == 1) {
						iStep = -1;
					}
				}
				else if (i == 0) {
					if (iStep == -1) {
						iStep = 1;
					}
				}
			}
			else {
				// stop if at end
				if (i == this.points.length-1) {
					break;
				}
			}

			if (t >= this.times[i+iStep]) {
				t -= this.times[i+iStep];
				i += iStep;
				continue;
			}
			else {
				break;
			}
		}

		if (!this.loop && i == this.points.length-1) {
			// end of path
			p.set(this.points[i]);
		}
		else {
			// between two control points
			p.set(this.points[i+iStep]).sub(this.points[i]).mul(t/this.times[i+iStep]).add(this.points[i]);
		}

		return new Ptero.PathState(i,iStep,t,p);
	},

	step: function(dt) {
		this.state = this.seek(dt);
	},

	reset: function() {
		this.state.index = 0;
		this.state.indexStep = 1;
		this.state.time = 0;
		this.state.pos.set(points[0]);
	},

	isDone: function() {
		return !this.loop && this.state.index == this.points.length-1;
	},
};

Ptero.makeEnemyPath = function() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.screen.getFrustum();
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.far;

	// starting depth
	var start = Math.random()*(4*far)+far;

	// start point
	var x0,y0,z0;

	// random screen position range
	var xrange = aspect*size*2;
	var yrange = size;

	// random screen position
	x0 = Math.random()*xrange - xrange/2;
	y0 = Math.random()*yrange - yrange/3;

	// project position to start depth
	x0 = x0/near*start;
	y0 = y0/near*start;
	z0 = start;

	// end point
	var x1,y1,z1;

	// random screen position
	xrange /= 2;
	yrange /= 2;
	x1 = Math.random()*xrange - xrange/2;
	y1 = Math.random()*yrange - yrange/2;
	z1 = near;

	// get distance traveled
	var dx = x1-x0;
	var dy = y1-y0;
	var dz = z1-z0;
	var dist = Math.sqrt(dx*dx+dy*dy+dz*dz);

	// get time to complete
	var speed = (far-near) / 5;
	var time = dist/speed;

	// set path
	return new Ptero.Path(
			[ new Ptero.Vector(x0,y0,z0), new Ptero.Vector(x1,y1,z1) ],
			[ time, time ],
			false); // loop flag
};

Ptero.scene_game = (function() {
	var enemies = [];
	var numEnemies = 20;

	var sortEnemies = function() {
		enemies.sort(function(a,b) {
			return b.path.state.pos.z - a.path.state.pos.z;
		});
	};

	var init = function() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
		for (i=0; i<numEnemies; i++) {
			enemies.push(new Ptero.Enemy);
		}
	};

	var update = function(dt) {
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].update(dt);
		}
		sortEnemies();
	};

	var draw = function(ctx) {
		Ptero.background.draw(ctx);
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].draw(ctx);
		}
		Ptero.orb.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();

Ptero.StopWatch = function() {
	this.reset();
};

Ptero.StopWatch.prototype = {
	reset: function() {
		this.elapsedMillis = 0;
	},
	increment: function(millis) {
		this.elapsedMillis += millis;
	},
};

Ptero.Timer = function(millisLimit) {
	this.millisLimit = millisLimit;
	this.stopWatch = new Ptero.StopWatch;
};

Ptero.Timer.prototype = {
	setFinishCallback: function(callback) {
		this.onFinish = callback;
	},
	isDone: function() {
		return this.stopWatch.elapsedMillis > this.millisLimit;
	},
	getElapsedMillis: function() {
		return this.stopWatch.elapsedMillis;
	},
	reset: function() {
		this.stopWatch.reset();
	},
	increment: function(millis) {
		if (this.isDone()) {
			this.onFinish && this.onFinish();
		}
		else {
			this.stopWatch.increment(millis);
		}
	},
};

Ptero.Vector = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

Ptero.Vector.prototype = {
	set: function(vector) {
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;
		return this;
	},
	add: function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		return this;
	},
	sub: function(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		return this;
	},
	mul: function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	},
};
window.onload = function() {

	// Create the canvas element.
	// (CocoonJS provides a more efficient screencanvas if you're using one main canvas).
	var canvas = document.createElement(
			navigator.isCocoonJS ? 'screencanvas' : 'canvas');
	document.body.appendChild(canvas);

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	Ptero.assets.load(function(){
		Ptero.screen.init(canvas);
		//Ptero.setScene(Ptero.stress_scene);
		Ptero.setScene(Ptero.scene_game);
		Ptero.executive.start();
	});
};
