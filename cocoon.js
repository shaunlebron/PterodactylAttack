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
		"bullet": "img/bullet_sheet.png",
	};

	var images = {};
	var sheets = {};

	function loadSpriteSheets() {
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

	function load(callback) {
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
		getScale: function getScale() { return scale; },
		setImage: function setImage(img) {
			image = img;
			var aspect = image.width / image.height;
			var scaleH = Ptero.screen.getHeight() / image.height;
			var scaleW = Ptero.screen.getWidth() / image.width;
			scale = (aspect > Ptero.screen.getAspect()) ? scaleH : scaleW;
		},
		draw: function draw(ctx) {
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

        return function updateFps(now) {
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
	function drawFps(ctx) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "#FFF";
		var pad = 5;
		var x = pad;
		var y = Ptero.screen.getHeight() - pad;
		ctx.fillText(Math.floor(fps)+" fps", x, y);
	};

	function tick(time) {
		try {
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
		}
		catch (e) {
			console.error(e.message + "@" + e.sourceURL);
			console.error(e.stack);
		}
	};

	var isPaused = false;
	function pause() {
		isPaused = true;
	};
	function resume() {
		isPaused = false;
	};

	function start() {
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

	function setSize(w,h) {
		width = w;
		height = h;
		aspect = width/height;
		canvas.width = width;
		canvas.height = height;
	};

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		if (navigator.isCocoonJS) {
			setSize(window.innerWidth, window.innerHeight);
		}
		else {
			setSize(720,480);
		}

		var fov = 30*Math.PI/180;
		var near = height/2 / Math.tan(fov/2);
		var far = near*7;
		frustum = new Ptero.Frustum(near,far,fov,aspect);

		Ptero.sizeFactor = frustum.nearTop;
	};

	// Determine screen coordinates from a point in the frustum.
	function spaceToScreen(vector) {
		var v = frustum.projectToNear(vector);
		return new Ptero.Vector(
			(v.x/frustum.nearWidth + 0.5) * width,
			(-v.y/frustum.nearHeight + 0.5) * height);
	};

	// Determine point on the frustum's near plane from a screen coordinate.
	function screenToSpace(vector) {
		return new Ptero.Vector(
			(vector.x/width - 0.5) * frustum.nearWidth,
			-(vector.y/height - 0.5) * frustum.nearHeight,
			frustum.near);
	};

    function getScreenToSpaceRatio() {
        return (width) / frustum.nearWidth;
    };

	function getCanvasPos() {
		var p = {x:0,y:0};
		if (navigator.isCocoonJS) {
			return p;
		}
		var obj = canvas;
		var addOffset = function(obj) {
			p.x += obj.offsetLeft;
			p.y += obj.offsetTop;
		};
		addOffset(obj);
		while (obj = obj.offsetParent) {
			addOffset(obj);
		}
		return p;
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
        getScreenToSpaceRatio: getScreenToSpaceRatio,
		getCanvasPos: getCanvasPos,
	};
})();


Ptero.input = (function(){

	// A touch handler is a dictionary of callback functions for each touch event.
	//		var touchHandler = {
	//			start: function(x,y) {
	//			},
	//			move: function(x,y) {
	//			},
	//			end: function(x,y) {
	//			},
	//			cancel: function(x,y) {
	//			},
	//		};
	var touchHandlers = [];
	function addTouchHandler(h) {
		touchHandlers.push(h);
	};
	function removeTouchHandler(h) {
		var i;
		while ( (i=touchHandlers.indexOf(h)) != -1) {
			touchHandlers.splice(i,1);
		}
	};
	function forEachTouchHandler(callback) {
		var len = touchHandlers.length;
		var i;
		for (i=0; i<len; i++) {
			callback(touchHandlers[i],i);
		};
	};

	var touched = false; // is screen currently being touched.
	var point = {}; // current touch point.

	// Main dispatch functions for each touch event.
	function touchStart(x,y) {
		touched = true;
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.start && h.start(x,y);
		});
	};
	function touchMove(x,y) {
		if (!touched) {
			return;
		}
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.move && h.move(x,y);
		});
	};
	function touchEnd(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.end && h.end(x,y);
		});
	};
	function touchCancel(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.cancel && h.cancel(x,y);
		});
	};

	// initialize 
	function init() {

		// Makes sure the given callback function gets canvas coords, not absolute coords.
        var canvas = Ptero.screen.getCanvas();
		var wrapFunc = function(f) {
			return function(evt) {
				var canvasPos = Ptero.screen.getCanvasPos();
				var p = {x:canvasPos.x, y:canvasPos.y};
				var x,y;
				if (evt.touches && evt.touches.length > 0) {
					x = evt.touches[0].pageX;
					y = evt.touches[0].pageY;
				}
				else {
					x = evt.pageX;
					y = evt.pageY;
				}
				p.x = x - p.x;
				p.y = y - p.y;
				f(p.x,p.y);
			};
		};
		canvas.addEventListener('mousedown',	wrapFunc(touchStart));
		canvas.addEventListener('mousemove',	wrapFunc(touchMove));
		canvas.addEventListener('mouseup',		wrapFunc(touchEnd));
		canvas.addEventListener('mouseout',		wrapFunc(touchCancel));
		canvas.addEventListener('touchstart',	wrapFunc(touchStart));
		canvas.addEventListener('touchmove',	wrapFunc(touchMove));
		canvas.addEventListener('touchend',		wrapFunc(touchEnd));
		canvas.addEventListener('touchcancel',	wrapFunc(touchCancel));
	};

	return {
		init: init,
		isTouched: function() { return touched; },
		getPoint: function() { return point; },
		addTouchHandler: addTouchHandler,
		removeTouchHandler: removeTouchHandler,
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
	draw: function draw(ctx,x,y,frame,scale,highlight) {
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
		if (highlight) {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			ctx.fillRect(x,y,dw,dh);
			ctx.strokeStyle = "#f00";
			ctx.lineWidth = 2;
			ctx.strokeRect(x,y,dw,dh);
		}
	},
	drawCentered: function drawCentered(ctx,x,y,frame,scale,highlight) {
		x -= this.tileCenterX * scale;
		y -= this.tileCenterY * scale;
		this.draw(ctx,x,y,frame,scale,highlight);
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
	start: function start() {
		this.animating = true;
	},
	restart: function restart() {
		this.reset();
		this.start();
	},
	stop: function stop() {
		this.animating = false;
	},
	reset: function reset() {
		this.time = 0;
	},
	setRepeat: function setRepeat(on) {
		this.repeat = on;
	},
	setFinishCallback: function setFinishCallback(callback) {
		this.onFinish = callback;
	},
	isDone: function isDone() {
		return (this.time >= this.totalDuration);
	},
	update: function update(dt) {
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
	draw: function draw(ctx,x,y,scale,highlight) {
		this.sheet.draw(ctx,x,y,this.frame,scale,highlight);
	},
	drawCentered: function drawCentered(ctx,x,y,scale, highlight) {
		this.sheet.drawCentered(ctx,x,y,this.frame,scale,highlight);
	},
	draw3D: function draw3D(ctx,pos,highlight) {
		var closeWidth = this.sheet.tileWidth * Ptero.background.getScale();
		var scale = Ptero.screen.getFrustum().getDepthScale(pos.z, closeWidth) / closeWidth;
		var screenPos = Ptero.screen.spaceToScreen(pos);
		this.drawCentered(ctx, screenPos.x, screenPos.y, scale, highlight);
	},
};

// Deferred sprites allow for drawing the sprites in a correct order.
// This allows closer sprites to be drawn over those further away.
Ptero.deferredSprites = (function(){
	var sprites=[];
	var len=0;
	function clear() {
		sprites.length = 0;
		len = 0;
	};
	function defer(draw,z) {
		sprites[len++] = {draw:draw, z:z};
	};
	function finalize() {
		sprites.sort(function(a,b) { return b.z - a.z; });
	};
	function draw(ctx) {
		var i;
		for (i=0; i<len; i++) {
			sprites[i].draw(ctx);
		}
	};
	return {
		clear: clear,
		defer: defer,
		finalize: finalize,
		draw: draw,
	};
})();

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

Ptero.Bullet = function() {
	this.pos = new Ptero.Vector;
	this.dir = new Ptero.Vector;
	this.speed = 0;
	this.time = 0;
	this.collideTime = null;
	this.collideTarget = null;
	this.sprite = new Ptero.AnimSprite(Ptero.assets.sheets.bullet);
};

Ptero.Bullet.prototype = {
	lifeTime: 5, // seconds
	update: function update(dt) {
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
	},
	draw: function draw(ctx) {
		var p = Ptero.screen.spaceToScreen(this.pos);
		this.sprite.draw3D(ctx, this.pos);
	},
};

Ptero.bulletpool = (function(){
	var bullets = [];
	var max_bullets = 100;

	function getFreeIndex() {
		var i;
		for (i=0; i<max_bullets; i++) {
			if (!bullets[i]) {
				return i;
			}
		}
		return -1;
	};

	function add(bullet) {
		var i = getFreeIndex();
		if (i != -1) {
			bullets[i] = bullet;
		}
	};

	function update(dt) {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (!b) {
				continue;
			}
			b.update(dt);
			if (b.collideTarget && b.time > b.collideTime) {
				b.collideTarget.onHit && b.collideTarget.onHit();
				bullets[i] = null;
			}
			else if (b.time > b.lifeTime) {
				bullets[i] = null;
			}
		}
	};

	function deferBullets() {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (b) {
				Ptero.deferredSprites.defer(
					(function(b){
						return function(ctx) {
							b.draw(ctx);
						};
					})(b),
					b.pos.z);
			}
		}
	};

	function clear() {
		var i;
		for (i=0; i<max_bullets; i++) {
			bullets[i] = null;
		}
	};

	return {
		add: add,
		update: update,
		deferBullets: deferBullets,
		clear: clear,
	};
})();

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
};

Ptero.Enemy.prototype = {
	randomizeBoom: function randomizeBoom() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
		this.boomSprite.restart();
	},
	isHittable: function isHittable() {
		return !this.path.isDone() && !this.isHit; // only hittable if not already hit
	},
	getPosition: function getPosition() {
		return this.path.state.pos;
	},
	getCollisionRadius: function getCollisionRadius() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time).pos;
	},
	onHit: function onHit() {
		// update score
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		this.isHit = true;
		var that = this;
	},
	resetPosition: function resetPosition() {
		this.randomizeBoom();
		this.path = Ptero.makeEnemyPath();
		this.isHit = false;
		this.doneTimer.reset();
		this.isGoingToDie = false;
	},
	update: function update(dt) {
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
			// update position
			this.path.step(dt);

			// update animation
			this.babySprite.update(dt);
		}
	},
	getSize: function() {
		return this.babySprite.sheet.tileWidth;
	},
	draw: function draw(ctx) {
		var pos = this.path.state.pos;

		if (this.isHit) {
			this.boomSprite.draw3D(ctx, pos, this.highlight);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.draw3D(ctx, pos, this.highlight);
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
	projectToZ: function projectToZ(vector,newz) {
		return new Ptero.Vector(
			vector.x/vector.z*newz,
			vector.y/vector.z*newz,
			newz);
	},
	projectToNear: function projectToNear(vector) {
		return this.projectToZ(vector,this.near);
	},
	isInside: function isInside(vector) {
		var v = this.projectToNear(vector);
		return (this.far >= vector.z && vector.z > 0 &&
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function getDepthScale(z,nearScale) {
		return nearScale/z*this.near;
	},
};
Ptero.orb = (function(){
	
	// A note about coordinate systems:
	// Screen coordinates are usual pixel coordinates: topleft (0,0); bottomright (width-1,height-1)
	// Space coordinates are defined by the frustum, origin at center, +x right, +y up.
	//
	// Input touch coordinates are translated immediately from screen to space.
	// All bullet coordinates are in space coordinates.

	// radius of the orb on screen and in space
	function getRadius() {
		return Ptero.screen.getHeight()/2 * (1/2*0.8);
	}
	function getSpaceRadius() {
		return getRadius() / Ptero.screen.getScreenToSpaceRatio();
	}

	// charging object
	var charge = (function(){
		var on = false;
		var maxTime = 7;
		var time = 0;

		function update(dt) {
			if (on) {
				time = Math.min(time+dt, maxTime);
			}
		};

		function draw(ctx,pos) {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			var s;
			if (time == maxTime) {
				s = 1;
			}
			else {
				s = time/maxTime*(1 + Math.cos(20*time)*0.05);
			}
			ctx.beginPath();
			ctx.arc(pos.x,pos.y,s*getRadius(), 0, 2*Math.PI);
			ctx.fill();
		};

		function reset() {
			on = false;
			time = 0;
		};

		function start() {
			on = true;
			time = 0;
		};
		
		return {
			start: start,
			reset: reset,
			update: update,
			draw: draw,
			isOn: function() { return on; },
		};
	})();

	// origin of the orb with next transition point
	var origin;
	var next_origin;
	var setOrigin,setNextOrigin;
	function convertFracToAbs(xfrac, yfrac) {
		var frustum = Ptero.screen.getFrustum();
		return new Ptero.Vector(
				xfrac * frustum.nearRight,
				yfrac * frustum.nearTop,
				frustum.near);
	};
	function setNextOrigin(xfrac, yfrac) {
		next_origin = convertFracToAbs(xfrac,yfrac);
	};
	function setOrigin(xfrac, yfrac) {
		origin = convertFracToAbs(xfrac,yfrac);
	};


	// the orb's targets.
	var targets;
	function setTargets(_targets) {
		targets = _targets;
	};

	function init() {
		charge.reset();
		setOrigin(0,-2);
		enableTouch();
	};

	function update(dt) {
		origin.ease_to(next_origin, 0.1);
		Ptero.bulletpool.update(dt);
		charge.update(dt);
	};

	function draw(ctx) {
		var radius = getRadius();
		var p = Ptero.screen.spaceToScreen(origin);

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(p.x,p.y,radius, 0, 2*Math.PI);
		ctx.fill();
		charge.draw(ctx,p);
	};

	// Get a unit vector pointing from the origin to the given point in space.
	function getAimVector(point) {
		return point.copy().sub(origin).normalize();
	};

	// Highlights specific targets for debugging. (currently the lock-on target).
	var shotTarget = null;
	var setShotTarget = function(target) {
		if (shotTarget) {
			shotTarget.highlight = false;
		}
		shotTarget = target;
		if (shotTarget) {
			shotTarget.highlight = true;
		}
	};

	var maxAimAngleError = 5 * Math.PI/180;

	// Try to fire a bullet into the given direction.
	function shoot(aim_vector) {
		var target = chooseTargetFromAimVector(aim_vector);
		//setShotTarget(target);

		var aimAngleError = getAimAngleError(target.getPosition(), aim_vector);
		var bullet, bulletCone;
		if (!target.isGoingToDie && aimAngleError < maxAimAngleError) {
			bullet = createHomingBullet(target);
			target.isGoingToDie = true;
		}
		else {
			bulletCone = target ? getTargetBulletCone(target) : getDefaultBulletCone(aim_vector);
			bullet = createBulletFromCone(bulletCone, aim_vector);
		}

		if (bullet) {
			Ptero.bulletpool.add(bullet);
		}
		else {
			console.error("unable to create bullet");
		}
	};

	// Return the angle error of our aim when targeting the given position.
	function getAimAngleError(target_pos, aim_vector) {
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var target_vec = getAimVector(target_proj);
		var target_angle = target_vec.angle(aim_vector);
		return target_angle;
	};

	// Choose which target to shoot with the given aiming vector.
	function chooseTargetFromAimVector(aim_vector) {

		// find visible cube nearest to our line of trajectory
		var angle = 30*Math.PI/180;
		var chosen_target = null;
		var i,len;
		var frustum = Ptero.screen.getFrustum();
		for (i=0,len=targets.length; targets && i<len; ++i) {
			if (!targets[i].isHittable()) {
				continue;
			}

			// skip if not visible
			var target_pos = targets[i].getPosition();
			if (!frustum.isInside(target_pos)) {
				//continue;
			}

			var target_angle = getAimAngleError(target_pos, aim_vector);

			// update closest
			if (target_angle < angle) {
				angle = target_angle;
				chosen_target = targets[i];
			}
		}
		return chosen_target;
	};

	function getBulletSpeed() {
		return Ptero.background.getScale() * Ptero.screen.getHeight() * 50;
	}

	// Create a bullet with the necessary trajectory to hit the given target.
	function createHomingBullet(target) {

		// Create bullet with default speed.
		var bullet = new Ptero.Bullet;
		bullet.collideTarget = target;
		bullet.speed = getBulletSpeed();

		// Create time window and step size to search for a collision.
		var t;
		var maxT = bullet.lifeTime; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		// Determine the threshold for a valid collision.
		var dist, minDist = Infinity;

		// Find when the bullet will collide with the target.
		var target_pos;
		for (t=0; t < maxT; t += dt)
		{
			// Get the target position at time t.
			target_pos = target.getFuturePosition(t);

			// Aim bullet at target and advance to time t.
			bullet.time = 0;
			bullet.pos.set(origin);
			bullet.dir.set(getAimVector(target_pos));
			bullet.update(t);

			// Determine distance between target and bullet.
			dist = bullet.pos.dist(target_pos);

			// Update the collision info when closest distance reached.
			if (dist < minDist) {
				bullet.collideTime = t;
				bullet.collideDir = bullet.dir.copy();
				minDist = dist;
			}
		}

		// Aim bullet at point of closest distance.
		bullet.dir.set(bullet.collideDir);

		// Reset bullet position and time.
		bullet.time = 0;
		bullet.pos.set(origin);

		return bullet;
	};

	function getTargetBulletCone(target) {
		var target_pos = target.getPosition();
		var z = target_pos.z;
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var r = target_proj.dist(origin);
		return {r:r, z:z};
	};

	function getDefaultBulletCone() {
		var frustum = Ptero.screen.getFrustum();
		return {r: frustum.nearTop, z: frustum.near * 3};
	};

	function createBulletFromCone(cone, aim_vector) {
		var frustum = Ptero.screen.getFrustum();
		var vector = aim_vector.copy().mul(cone.r);
		vector.add(origin);
		vector.set(frustum.projectToZ(vector,cone.z)).sub(origin).normalize();

		var bullet = new Ptero.Bullet;
		bullet.speed = getBulletSpeed();
		bullet.pos.set(origin);
		bullet.dir.set(vector);
		return bullet;
	};

	// Create touch controls.
	var touchHandler = (function(){

		// Determine if the given point is in the orb's touch surface.
		function isInside(point) {
			var r = getSpaceRadius();
			return point.dist_sq(origin) <= r*r;
		};

		// Start the charge if touch starts inside the orb.
		function start(point) {
			if (isInside(point)) {
				charge.start();
			}
		};

		// Shoot a bullet when the touch point exits the orb.
		function move(point) {
			if (charge.isOn() && !isInside(point)) {
				charge.reset();
				shoot(getAimVector(point));
			}
		};

		// Stop charging if touch point is released or canceled.
		function end() {
			charge.reset();
		};
		function cancel() {
			charge.reset();
		};

		// Convert the incoming xy coords from screen to space.
		function wrapFunc(f) {
			return function screenToSpaceWrapper(x,y) {
				var point = Ptero.screen.screenToSpace({x:x,y:y});
				f(point);
			};
		};
		return {
			start: wrapFunc(start),
			move: wrapFunc(move),
			end: wrapFunc(end),
			cancel: wrapFunc(cancel),
		};
	})();
	function enableTouch() {
		Ptero.input.addTouchHandler(touchHandler);
	};
	function disableTouch() {
		Ptero.input.removeTouchHandler(touchHandler);
	};

	return {
		init: init,
		draw: draw,
		setTargets: setTargets,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
	};
})();
Ptero.PathState = function(index,indexStep,time,pos) {
	if (index == null) index = 0;
	if (indexStep == null) indexStep = 1;
	if (time == null) time = 0;
	if (pos == null) pos = new Ptero.Vector;
	this.index = index;
	this.indexStep = indexStep;
	this.time = time;
	this.pos = pos;
};

Ptero.Path = function(points, times, loop) {
	this.points = points;
	this.times = times;
	this.loop = loop;
	this.state = new Ptero.PathState;
	this.reset();
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function seek(dt) {

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

	step: function step(dt) {
		this.state = this.seek(dt);
	},

	reset: function reset() {
		this.state.index = 0;
		this.state.indexStep = 1;
		this.state.time = 0;
		this.state.pos.set(this.points[0]);
	},

	isDone: function isDone() {
		return !this.loop && this.state.index == this.points.length-1;
	},
};

Ptero.makeEnemyPath = function makeEnemyPath() {

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

	function init() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
		for (i=0; i<numEnemies; i++) {
			enemies.push(new Ptero.Enemy);
		}

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);
	};

	function update(dt) {
		Ptero.deferredSprites.clear();
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].update(dt);
			// TODO: only defer if visible
			Ptero.deferredSprites.defer(
				(function(e) {
					return function(ctx){
						e.draw(ctx);
					};
				})(enemies[i]),
				enemies[i].getPosition().z);
		}
		Ptero.orb.update(dt);
		Ptero.bulletpool.deferBullets();
		Ptero.deferredSprites.finalize();
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		Ptero.deferredSprites.draw(ctx);
		Ptero.orb.draw(ctx);
		var point;
		if (Ptero.input.isTouched()) {
			point = Ptero.input.getPoint();
			ctx.fillStyle = "rgba(255,255,255,0.2)";
			ctx.beginPath();
			ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
			ctx.fill();
		}
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
	reset: function reset() {
		this.elapsedMillis = 0;
	},
	increment: function increment(millis) {
		this.elapsedMillis += millis;
	},
};

Ptero.Timer = function(millisLimit) {
	this.millisLimit = millisLimit;
	this.stopWatch = new Ptero.StopWatch;
};

Ptero.Timer.prototype = {
	setFinishCallback: function setFinishCallback(callback) {
		this.onFinish = callback;
	},
	isDone: function isDone() {
		return this.stopWatch.elapsedMillis > this.millisLimit;
	},
	getElapsedMillis: function getElapsedMillis() {
		return this.stopWatch.elapsedMillis;
	},
	reset: function reset() {
		this.stopWatch.reset();
	},
	increment: function increment(millis) {
		if (this.isDone()) {
			this.onFinish && this.onFinish();
		}
		else {
			this.stopWatch.increment(millis);
		}
	},
};

Ptero.Vector = function(x,y,z) {
	if (z == undefined) z = 0;
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
	copy: function() {
		return (new Ptero.Vector).set(this);
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
	dot: function(vector) {
		return (
			this.x * vector.x +
			this.y * vector.y +
			this.z * vector.z);
	},
	dist_sq: function(vector) {
		var dx = this.x - vector.x;
		var dy = this.y - vector.y;
		var dz = this.z - vector.z;
		return (dx*dx + dy*dy + dz*dz);
	},
	dist: function(vector) {
		return Math.sqrt(this.dist_sq(vector));
	},
	ease_to: function(vector,ratio) {
		this.x += (vector.x - this.x) * ratio;
		this.y += (vector.y - this.y) * ratio;
		this.z += (vector.z - this.z) * ratio;
	},
	mag: function() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	},
	normalize: function() {
		var d = this.mag();
		this.x /= d;
		this.y /= d;
		this.z /= d;
		return this;
	},
	angle: function(vector) {
		return Math.abs(Math.acos(this.dot(vector)));
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
		Ptero.input.init();
		Ptero.setScene(Ptero.scene_game);
		Ptero.executive.start();
	});
};
