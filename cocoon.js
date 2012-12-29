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
		"bg":   "img/Desert_BG.png",
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
		var y = Ptero.screen.height - pad;
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
	var width = 720;
	var height = 480;
	var fov = 60*Math.PI/180;
	var near = 1;
	var far = 100;
	var canvas,ctx;

	var init = function(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");
		canvas.width = width;
		canvas.height = height;
	};

	return {
		width: width,
		height: height,
		fov: fov,
		near: near,
		far: far,
		init: init,
		getCanvas: function(){return canvas;},
		getCtx: function(){return ctx;},
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

	var bgImg;

	var init = function() {

		bgImg = Ptero.assets.images.bg;

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
		ctx.drawImage(bgImg,0,0);
		var i;
		for (i=0; i<numBabies; i++) {
			babies[i].draw(ctx);
		}

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		var radius = 100;
		var x = Ptero.screen.width/2;
		var y = Ptero.screen.height;
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

	var screen_w = Ptero.screen.width;
	var screen_h = Ptero.screen.height;
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
window.onload = function() {
	var canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	Ptero.assets.load(function(){
		Ptero.screen.init(canvas);
		Ptero.setScene(Ptero.stress_scene);
		Ptero.executive.start();
	});
};
