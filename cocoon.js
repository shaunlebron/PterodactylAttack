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
(function(){
	/*
	In general, we want a way to interpolate between a collection of points.
	Each point should have a "delta time", the time it takes to get to this
	point from the last.

	For example, for points (a,b,c), and delta times (t1, t2):

		at t=0,     point = a
		at t=t1,    point = b
		at t=t1+t2, point = c

	We also want an _interpolation_ function to give us a point at any given
	time in the valid time range:

	    function interp(t) {
	    	return a point interpolated between the given points
	    }

	Currently, we have two types of interpolation functions:

	1. Point-to-point interpolation using different easing functions (e.g. linear, sinusoid)
	2. Spline interpolation with continuous 1st and 2nd derivative for smooth movement between control points.
	*/

	// Get the sum of the numbers in the given array.
	function sum(values) {
		var i,len = values.length;
		var total = 0;
		for (i=0; i<len; i++) {
			total += values[i];
		}
		return total;
	}

	// Bound a value to the given min and max.
	function bound(value, min, max) {
		value = Math.max(min, value);
		value = Math.min(max, value);
		return value;
	}

	// Get the current time segment from the given current time and delta times.
	function getTimeSegment(t, deltaTimes) {
		var i,len=deltaTimes.length;
		for (i=0; i<len; i++) {
			if (t <= deltaTimes[i]) {
				break;
			}
			else {
				t -= deltaTimes[i];
			}
		}
		if (i == len) {
			i = len-1;
			t = deltaTimes[len-1];
		}
		return {
			index: i,
			time: t,
			timeFrac: t/deltaTimes[i],
		};
	}

	// A collection of easing functions.
	// Input: two points (a,b) and 0<=t<=1
	var easeFunctions = {
		linear: function(a,b,t) { return a + (b-a) * t; },
	};

	// Create an interpolation function for a given collection of points and delta times.
	//
	// Input:
	//   easeFuncName = name of function (from `easeFunctions`) to use to interpolate between two points
	//   values = values to be interpolated
	//   deltaTimes = times between each value
	//
	// Output:
	//   function(t) -> interpolated value
	//
	// Example:
	//
	//   (Create linear interpolation from 0 to 10 in 2.5s)
	//   var interp = makeInterp('linear', [0,10], [2.5]);  
	//
	//   (Get interpolated value at 0.75s)
	//   var val = interp(0.75);
	Ptero.makeInterp = function(easeFuncName, values, deltaTimes) {
		var totalTime = sum(deltaTimes);
		var easeFunc = easeFunctions[easeFuncName];

		function interp(t) {
			t = bound(t, 0, totalTime);
			var seg = getTimeSegment(t, deltaTimes);
			var i = seg.index;
			return easeFunc(values[i], values[i+1], seg.timeFrac);
		};
		interp.totalTime = totalTime;

		return interp;
	};

	// Create a dimension-wise interpolation function for a given colleciton of
	// multidimensional points and delta times.
	//
	// Input:
	//   easeFuncName = name of function (from `easeFunctions`) to use to interpolate between two points
	//   objs = objects to be interpolated
	//   keys = keys to interpolate for each object
	//   deltaTimes = times between each value
	//
	// Output:
	//   function(t) -> interpolated object
	//
	// Example:
	//
	//   (Create linear interpolation for {x:0,y:0} to {x:20,y:35} in 2.5s)
	//   var interp = makeInterp('linear', [{x:0,y:0}, {x:20, y:35}], ['x', 'y'], [2.5]);
	//
	//   (Get interpolated object at 0.75s)
	//   var obj = interp(0.75);
	Ptero.makeInterpForObjs = function(easeFuncName, objs, keys, deltaTimes) {
		var numKeys = keys.length;

		var totalTime = sum(deltaTimes);
		var easeFunc = easeFunctions[easeFuncName];

		function interp(t) {
			t = bound(t, 0, totalTime);
			var seg = getTimeSegment(t, deltaTimes);
			var i = seg.index;
		
			var result = {};
			var ki,key;
			for (ki=0; ki<numKeys; ki++) {
				key = keys[ki];
				result[key] = easeFunc(objs[i][key], objs[i+1][key], seg.timeFrac);
			}
			return result;
		};
		interp.totalTime = totalTime;

		return interp;
	};

	// Begin scope for cubic hermite interpolation.
	(function(){

		// Returns a polynomial function to interpolate between the given points
		// using hermite interpolation.
		//
		// See "Interpolation on arbitrary interval" at:
		//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
		//
		// p0 = start position
		// m0 = start slope
		// x0 = start time
		// p1 = end position
		// m1 = end slope
		// x1 = end time
		function cubichermite(p0,m0,x0,p1,m1,x1) {
			return function(x) {
				var dx = x1-x0;
				var t = (x-x0) / dx;
				var t2 = t*t;
				var t3 = t2*t;
				return (
					(2*t3 - 3*t2 + 1)*p0 +
					(t3 - 2*t2 + t)*dx*m0 +
					(-2*t3 + 3*t2)*p1 +
					(t3-t2)*dx*m1
				);
			};
		}

		// Calculates an endpoint slope for cubic hermite interpolation.
		//
		// See "Finite difference" under "Interpolating a data set" at:
		//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
		//
		// p0 = start position
		// t0 = start time
		// p1 = end position
		// t1 = end time
		function getendslope(p0,t0,p1,t1) {
			return (p1-p0) / (t1-t0);
		}

		// Calculates a midpoint slope for cubic hermite interpolation.
		//
		// See "Finite difference" under "Interpolating a data set" at:
		//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
		//
		// p0 = start position
		// t0 = start time
		// p1 = mid position
		// t1 = mid time
		// p2 = end position
		// t2 = end time
		function getmidslope(p0,t0,p1,t1,p2,t2) {
			return (
				0.5 * getendslope(p0,t0,p1,t1) +
				0.5 * getendslope(p1,t1,p2,t2)
			);
		}

		// Calculate the slopes for each points to be interpolated using a Cubic
		// Hermite spline.
		//
		// See http://en.wikipedia.org/wiki/Cubic_Hermite_spline
		//
		// points = all the points to be interpolated
		// deltaTimes = delta times for each point
		function calcslopes(points,deltaTimes) {
			var len = points.length;
			var slopes=[],s;
			for (i=0;i<len;i++) {
				if (i==0) {
					s = getendslope(
							points[i],   0,
							points[i+1], deltaTimes[i]);
				}
				else if (i==len-1) {
					s = getendslope(
							points[i-1], 0,
							points[i],   deltaTimes[i-1]);
				}
				else {
					s = getmidslope(
							points[i-1], 0,
							points[i],   deltaTimes[i-1],
							points[i+1], deltaTimes[i-1]+deltaTimes[i]);
				}
				slopes[i] = s;
			}
			return slopes;
		}

		// Create a Cubic Hermite spline.
		// Returns a piece-wise array of spline functions.
		//
		// points = all the points to be interpolated
		// deltaTimes = delta times for each point
		// slopes = slope at each point
		//
		function calcspline(points,deltaTimes,slopes) {
			var i,len=points.length;
			var splinefuncs = [];
			for (i=0; i<len-1; i++) {
				splinefuncs[i] = cubichermite(
					points[i],   slopes[i],   0,
					points[i+1], slopes[i+1], deltaTimes[i]);
			}
			return splinefuncs;
		}

		// Create a Cubic Hermite interpolation function for a given collection of points and delta times.
		//
		// Input:
		//   values = values to be interpolated
		//   deltaTimes = times between each value
		//
		// Output:
		//   function(t) -> interpolated value
		//
		// Example:
		//
		//   (Create Cubic Hermite interpolation from 0 to 10 in 2.5s)
		//   var interp = makeHermiteInterp([2,10,8], [2.5,1.25]);  
		//
		//   (Get interpolated value at 0.75s)
		//   var val = interp(0.75);
		Ptero.makeHermiteInterp = function(values,deltaTimes) {
			var totalTime = sum(deltaTimes);

			var slopes = calcslopes(values,deltaTimes);
			var splinefuncs = calcspline(values,deltaTimes,slopes);

			function interp(t) {
				t = bound(t, 0, totalTime);
				var seg = getTimeSegment(t, deltaTimes);
				return splinefuncs[seg.index](seg.time);
			};
			interp.totalTime = totalTime;

			return interp;
		}

		// Create a dimension-wise Cubic Hermite interpolation function for a
		// given colleciton of multidimensional points and delta times.
		//
		// Input:
		//   values = values to be interpolated
		//   deltaTimes = times between each value
		//
		// Output:
		//   function(t) -> interpolated value
		//
		// Example:
		//
		//   (Create Cubic Hermite interpolation)
		//   var interp = makeHermiteInterp(
		//        [{x:2,y:4}, {x:7,y:25}, {x:32, y:3}],
		//        ['x','y'],
		//        [2.5, 1.25]);  
		//
		//   (Get interpolated value at 0.75s)
		//   var val = interp(0.75);
		Ptero.makeHermiteInterpForObjs = function(objs,keys,deltaTimes) {
			var numKeys = keys.length;
			var numObjs = objs.length;

			var totalTime = sum(deltaTimes);

			var values, slopes, splinefuncs={};
			var i,ki,key;
			for (ki=0; ki<numKeys; ki++) {
				key = keys[ki];
				values = [];
				for (i=0; i<numObjs; i++) {
					values[i] = objs[i][key];
				}
				slopes = calcslopes(values, deltaTimes);
				splinefuncs[key] = calcspline(values, deltaTimes, slopes);
			}

			function interp(t) {
				t = bound(t, 0, totalTime);
				var seg = getTimeSegment(t, deltaTimes);
				var result = {};
				var ki,key;
				for (ki=0; ki<numKeys; ki++) {
					key = keys[ki];
					result[key] = splinefuncs[key][seg.index](seg.time);
				}
				return result;
			};
			interp.totalTime = totalTime;

			return interp;
		};

	})(); // Close scope for cubic hermite interpolation.

})();

Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/Final_Desert.jpg",
		"baby": "img/baby_sheet.png",
		"boom1": "img/boom1_sheet.png",
		"boom2": "img/boom2_sheet.png",
		"boom3": "img/boom3_sheet.png",
		"bullet": "img/bullet_sheet.png",
		"pause": "img/pause.png",
		"logo": "img/LogoVivid.png",
	};

	var imageScales = {
		"baby": 2.0,
		//"boom1": 2.0/1000*2720,
		//"boom2": 2.0/1000*3500,
		"boom1": 2.0,
		"boom2": 2.0,
		"boom3": 4.0,
		"pause": 1.0,
		"logo": 0.8,
	};

	var images = {};
	var sheets = {};
	var billboards = {};

	function makeBillboards() {
		var x,y,w,h,scale,sheet,img,board;
		for (name in imageSources) {
			sheet = img = null;
			if (sheets.hasOwnProperty(name)) {
				sheet = sheets[name];
				x = sheet.tileCenterX;
				y = sheet.tileCenterY;
				w = sheet.tileWidth;
				h = sheet.tileHeight;
			}
			else if (images.hasOwnProperty(name)) {
				img = images[name];
				w = img.width;
				h = img.height;
				x = w/2;
				y = h/2;
			}
			else {
				continue;
			}
			board = new Ptero.Billboard(x,y,w,h,imageScales[name]);
			if (sheet) {
				sheet.billboard = board;
			}
			billboards[name] = board;
		}
	};

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
				makeBillboards();
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
		billboards: billboards,
	};
})();
// We try to remove the complexity of drawing a front-facing texture
// in the frustum by creating the notion of a "billboard".
// A billboard is a fixed-size rectangle that has a desired scale.
// All scales are relative to the background scale, since we use it
// to determine the aspect ratio of the game.

Ptero.Billboard = function(x,y,w,h,scale) {
	this.setCenter(x,y);
	this.setSize(w,h);
	this.scale = (scale == undefined) ? 1 : scale;
};

Ptero.Billboard.prototype = {
	setSize: function(w,h) {
		this.w = w;
		this.h = h;
	},
	setCenter: function(x,y) {
		this.centerX = x;
		this.centerY = y;
	},
	getSpaceRect: function(pos) {
		var frustum = Ptero.screen.getFrustum();
		var scale = this.scale * Ptero.background.getScale();
		scale /= Ptero.screen.getScreenToSpaceRatio();
		return {
			w: this.w * scale,
			h: this.h * scale,
			x: pos.x - this.centerX*scale,
			y: pos.y - this.centerY*scale,
			z: pos.z,
		};
	},
	getNearRect: function(pos) {
		var frustum = Ptero.screen.getFrustum();
		var scale = this.scale * Ptero.background.getScale();
		scale /= Ptero.screen.getScreenToSpaceRatio();
		scale = scale / pos.z * frustum.near;
		return {
			w: this.w * scale,
			h: this.h * scale,
			x: pos.x - this.centerX*scale,
			y: pos.y - this.centerY*scale,
			z: frustum.near,
		};
	},
	getScreenRect: function(pos) {
		var frustum = Ptero.screen.getFrustum();
		var screenPos = Ptero.screen.spaceToScreen(pos);
		var scale = this.scale * Ptero.background.getScale();
		scale = scale / pos.z * frustum.near;
		return {
			w: this.w * scale,
			h: this.h * scale,
			x: screenPos.x - this.centerX*scale,
			y: screenPos.y - this.centerY*scale,
		};
	},

	getRelativeCursor: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
		var midx = rect.x + rect.w/2;
		var midy = rect.y + rect.h/2;
		x -= midx;
		y -= midy;
		var nx,ny;
		
		// (x+yi)(cos + isin)
		// (xcos + ixsin + iycos - ysin)
		if (pos.angle) {
			var c = Math.cos(-pos.angle);
			var s = Math.sin(-pos.angle);
			nx = x*c - y*s;
			ny = x*s + y*c;
		}
		else {
			nx = x;
			ny = y;
		}

		nx += rect.w/2;
		ny += rect.h/2;
		return {x:nx, y:ny};
	},

	isInsideScreenRect: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
		var p = this.getRelativeCursor(x,y,pos);
		if (0 <= p.x && p.x <= rect.w &&
			0 <= p.y && p.y <= rect.h) {
			return true;
		}
		return false;
	},

	isOverRotationHandle: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
		var p = this.getRelativeCursor(x,y,pos);
		var dx = (rect.w/2) - p.x;
		var dy = 0 - p.y;
		var dist_sq = dx*dx+dy*dy;
		return dist_sq <= 64;
	},
};

// Drawing functions that take 3d frustum coordinates.
Ptero.painter = (function(){

	function drawImageFrame(ctx,image,pos,sx,sy,sw,sh,billboard) {
		var rect = billboard.getScreenRect(pos);
		var dx = rect.x;
		var dy = rect.y;
		var dw = rect.w;
		var dh = rect.h;
		var x = dx + dw/2;
		var y = dy + dh/2;
		var angle = pos.angle;
		if (angle) {
			ctx.translate(x,y);
			ctx.rotate(angle);
			dx -= x;
			dy -= y;
			ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
			ctx.rotate(-angle);
			ctx.translate(-x,-y);
		}
		else {
			ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
		}
	};

	function drawImage(ctx,image,pos,billboard) {
		var sx = 0;
		var sy = 0;
		var sw = image.width;
		var sh = image.height;
		drawImageFrame(ctx,image,pos,sx,sy,sw,sh,billboard);
	};

	function drawBorder(ctx,pos,color,billboard,handle) {
		var rect = billboard.getScreenRect(pos);
		var dx = rect.x;
		var dy = rect.y;
		var dw = rect.w;
		var dh = rect.h;
		var x = dx + dw/2;
		var y = dy + dh/2;
		var angle = pos.angle;
		if (angle) {
			ctx.translate(x,y);
			ctx.rotate(angle);
			dx -= x;
			dy -= y;
		}

		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		if (handle) {
			var r = 4;
			ctx.beginPath();
			ctx.moveTo(dx+dw/2-r, dy);
			ctx.lineTo(dx,dy);
			ctx.lineTo(dx,dy+dh);
			ctx.lineTo(dx+dw,dy+dh);
			ctx.lineTo(dx+dw,dy);
			ctx.lineTo(dx+dw/2+r, dy);
			ctx.arc(dx+dw/2,dy,r,0,Math.PI*2);
			ctx.stroke();
		}
		else {
			ctx.strokeRect(dx,dy,dw,dh);
		}

		if (angle) {
			ctx.rotate(-angle);
			ctx.translate(-x,-y);
		}
	};

	return {
		drawImageFrame: drawImageFrame,
		drawImage: drawImage,
		drawBorder: drawBorder,
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

Ptero.fadeToScene = function(scene, timeToFade) {
	Ptero.scene = new Ptero.FadeScene(Ptero.scene, scene, timeToFade);
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
	var showFps = false;
	function drawFps(ctx) {
		if (!showFps) {
			return;
		}
		if (Ptero.scene == Ptero.scene_fact) {
			return;
		}
		ctx.font = "30px Arial";
		ctx.fillStyle = "#FFF";
		ctx.textBaseline = "bottom";
		ctx.textAlign = "left";
		var pad = 5;
		var x = pad;
		var y = Ptero.screen.getHeight() - pad;
		ctx.fillText(Math.floor(fps)+" fps", x, y);
	};

	function tick(time) {
		try {
			updateFps(time);

			var dt;
			if (lastTime == undefined) {
				dt = 0;
			}
			else {
				dt = Math.min((time-lastTime)/1000, 1/minFps);
			}
			lastTime = time;

			var scene = Ptero.scene;
			if (!isPaused) {
				scene.update(dt*speedScale);
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
		requestAnimationFrame(tick);
	};

	var speedScale = 1.0;
	function slowmo() {
		speedScale = 0.25;
	};
	function regmo() {
		speedScale = 1.0;
	};

	return {
		start: start,
		pause: pause,
		isPaused: function() { return isPaused; },
		toggleFps: function() {
			showFps = !showFps;
		},
		togglePause: function() {
			if (isPaused) {
				resume();
			}
			else {
				pause();
			}
		},
		slowmo: slowmo,
		regmo: regmo,
		resume: resume,
	};
})();
Ptero.screen = (function(){
	var width;
	var height;
	var aspect;
	var canvas,ctx;
	var frustum;
	var borderSize;

	function setSize(w,h) {
		width = w;
		height = h;
		aspect = width/height;
		canvas.width = width;
		canvas.height = height;
	};

	function setStartSize(w,h) {
		width = w;
		height = h;
	};

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		setSize(width,height);

		var fov = 30*Math.PI/180;
		//var near = height/2 / Math.tan(fov/2);
		var near = 1;
		var far = near*5;
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
		if (borderSize) {
			p.x += borderSize;
			p.y += borderSize;
		}
		return p;
	};

	return {
		init: init,
		setBorderSize: function(s) { borderSize = s; },
		getWidth:	function() { return width; },
		getHeight:  function() { return height; },
		getAspect:  function() { return aspect; },
		getCanvas:	function() { return canvas; },
		getCtx:		function() { return ctx; },
		getFrustum: function() { return frustum; },
		setStartSize: setStartSize,
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

		// from: https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
		function toggleFullScreen(elm) {
			if (!document.fullscreenElement &&    // alternative standard method
					!document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
				if (elm.requestFullscreen) {
					elm.requestFullscreen();
				} else if (elm.mozRequestFullScreen) {
					elm.mozRequestFullScreen();
				} else if (elm.webkitRequestFullscreen) {
					elm.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			} else {
				if (document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
			}
		}
		document.addEventListener('keydown', function(e) {
			if (e.keyCode == 13) { // enter key
				toggleFullScreen(document.body);
			}
			else if (e.keyCode == 70) {
				Ptero.executive.toggleFps();
			}
		},false);
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
	draw: function(ctx,pos,frame) {
		var row = Math.floor(frame / this.cols);
		var col = frame % this.cols;
		var sx = col * this.tileWidth;
		var sy = row * this.tileHeight;
		var sw = this.tileWidth;
		var sh = this.tileHeight;
		Ptero.painter.drawImageFrame(
			ctx,
			this.img,
			pos,
			sx,sy,sw,sh,
			this.billboard
		);
	},
	drawBorder: function(ctx,pos,color,handle) {
		Ptero.painter.drawBorder(ctx,pos,color,this.billboard,handle);
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
	shuffleTime: function() {
		this.time = Math.random()*this.totalDuration;
	},
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
	draw: function(ctx,pos) {
		this.sheet.draw(ctx,pos,this.frame);
	},
	drawBorder: function(ctx,pos,color,handle) {
		this.sheet.drawBorder(ctx,pos,color,handle);
	},
	getBillboard: function() {
		return this.sheet.billboard;
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
		this.sprite.draw(ctx, this.pos);
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

Ptero.Enemy = function(makeNewPath) {
	this.makeNewPath = makeNewPath;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.babySprite.shuffleTime();

	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);
	this.boom3Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom3);
	this.boom3Sprite.setRepeat(false);
	this.randomizeBoom();

	this.resetPosition();
};

Ptero.Enemy.prototype = {
	randomizeBoom: function randomizeBoom() {
		//this.boomSprite = this.boom3Sprite;
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
		this.boomSprite.restart();
	},
	isHittable: function isHittable() {
		return !this.path.isDone() && !this.isHit; // only hittable if not already hit
	},
	getPosition: function getPosition() {
		return this.path.pos;
	},
	getCollisionRadius: function getCollisionRadius() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time);
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
		if (this.makeNewPath) {
			this.path = this.makeNewPath();
		}
		this.isHit = false;
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

			navigator.vibrate && navigator.vibrate(200);
			this.resetPosition();
		}
		else {
			// FLYING TOWARD SCREEN
			// update position
			this.path.step(dt);

			// update animation
			this.babySprite.update(dt);
		}
	},
	draw: function draw(ctx) {
		var pos = this.path.pos;

		if (this.isHit) {
			this.boomSprite.draw(ctx, pos);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.draw(ctx, pos);
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

	this.createBoundingBox();
	this.createEdges();
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
		return (/*this.far >= vector.z &&*/ vector.z > this.near &&
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function getDepthScale(z,nearScale) {
		return nearScale/z*this.near;
	},
	createBoundingBox: function createBoundingBox() {
		this.nearTop = Math.tan(this.fov/2)*this.near;
		this.nearRight = this.nearTop * this.aspect;
		this.nearBottom = -this.nearTop;
		this.nearLeft = -this.nearRight;
		this.nearWidth = this.nearRight * 2;
		this.nearHeight = this.nearTop * 2;

		this.farTop = Math.tan(this.fov/2)*this.far;
		this.farRight = this.farTop * this.aspect;
		this.farBottom = -this.farTop;
		this.farLeft = -this.farRight;
		this.farWidth = this.farRight * 2;
		this.farHeight = this.farTop * 2;

		this.xmin = this.farLeft;
		this.xmax = this.farRight;
		this.ymin = this.farBottom;
		this.ymax = this.farTop;
		this.zmin = this.near;
		this.zmax = this.far;

		this.xrange = this.xmax-this.xmin;
		this.yrange = this.ymax-this.ymin;
		this.zrange = this.zmax-this.zmin;

		this.xcenter = this.xmin + this.xrange/2;
		this.ycenter = this.ymin + this.yrange/2;
		this.zcenter = this.zmin + this.zrange/2;

	},
	createEdges: function createEdges() {
		n = this.near;
		f = this.far;
		nl = this.nearLeft;
		nr = this.nearRight;
		nt = this.nearTop;
		nb = this.nearBottom;
		fl = this.farLeft;
		fr = this.farRight;
		ft = this.farTop;
		fb = this.farBottom;

		this.edges = [
			[{x:nl, y:nt, z:n}, {x:nr, y:nt, z:n}, {x:nr, y:nb, z:n}, {x:nl, y:nb, z:n}], // near edges
			[{x:fl, y:ft, z:f}, {x:fr, y:ft, z:f}, {x:fr, y:fb, z:f}, {x:fl, y:fb, z:f}], // far edges
			[{x:nl, y:nt, z:n}, {x:fl, y:ft, z:f}], // top left edge
			[{x:nr, y:nt, z:n}, {x:fr, y:ft, z:f}], // top right edge
			[{x:nr, y:nb, z:n}, {x:fr, y:fb, z:f}], // bottom right edge
			[{x:nl, y:nb, z:n}, {x:fl, y:fb, z:f}], // top left edge
		];
	},
	getRandomPoint: function() {
		var x = Math.random() * this.xrange + this.xmin;
		var y = Math.random() * this.yrange + this.ymin;
		var z = Math.random() * this.zrange + this.zmin;
		return this.projectToZ({x:x,y:y,z:this.far},z);
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

	// Player will only hit a target if their aim is within this angle.
	var max2dHitAngle = 5 * Math.PI/180;

	// Try to fire a bullet into the given direction.
	function shoot(aim_vector) {
		var target = chooseTargetFromAimVector(aim_vector);
		//setShotTarget(target);

		// create bullet
		var bullet, bulletCone;
		if (!target) {
			bulletCone = getDefaultBulletCone(aim_vector);
			bullet = createBulletFromCone(bulletCone, aim_vector);
		}
		else {
			var aim2dAngle = get2dAimAngle(target.getPosition(), aim_vector);
			if (!target.isGoingToDie && aim2dAngle < max2dHitAngle) {
				bullet = createHomingBullet(target);
				target.isGoingToDie = true;
			}
			else {
				bulletCone = getTargetBulletCone(target);
				bullet = createBulletFromCone(bulletCone, aim_vector);
			}
		}

		if (bullet) {
			Ptero.bulletpool.add(bullet);
		}
		else {
			console.error("unable to create bullet");
		}
	};

	// Returns the angle between the target projected on the screen and the aim vector.
	function get2dAimAngle(target_pos, aim_vector) {
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var target_vec = getAimVector(target_proj);
		var target_angle = target_vec.angle(aim_vector);
		return target_angle;
	};

	// Returns the angle between the target and the aim vector.
	function get3dAimAngle(target_pos, aim_vector) {
		var target_vec = getAimVector(target_pos);
		var target_angle = target_vec.angle(aim_vector);
		return target_angle;
	};

	// Choose which target to shoot with the given aiming vector.
	function chooseTargetFromAimVector(aim_vector) {

		// find visible cube nearest to our line of trajectory
		var maxAim2dAngle = 15*Math.PI/180;
		var closestZ = Infinity;
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
				continue;
			}

			var target2dAngle = get2dAimAngle(target_pos, aim_vector);

			// update closest
			if (target2dAngle < maxAim2dAngle && target_pos.z < closestZ) {
				closestZ = target_pos.z;
				maxAim2dAngle = target2dAngle;
				chosen_target = targets[i];
			}
		}
		return chosen_target;
	};

	function getBulletSpeed() {
		var frustum = Ptero.screen.getFrustum();
		return frustum.nearTop * 120;
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
Ptero.Path = function(interp, loop) {
	this.interp = interp;
	this.totalTime = interp.totalTime;
	this.loop = loop;
	this.reset();
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function seek(dt) {

		// Turn the interpolated value into a vector object.
		// Also add the "angle" property to it.
		var i = this.interp(this.time+dt);
		var v = (new Ptero.Vector).set(i);
		v.angle = i.angle;

		return v;
	},

	step: function step(dt) {
		this.time += dt;
		if (this.loop) {
			this.time %= this.totalTime;
		}
		this.pos = this.seek(0);
	},

	reset: function reset() {
		this.time = 0;
		this.step(0);
	},

	isDone: function isDone() {
		return !this.loop && this.time >= this.totalTime; 
	},
};

Ptero.makeLinearEnemyPath = function() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.screen.getFrustum();
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.far;

	var xrange = aspect*size*2;
	var yrange = size;

	var startPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/3,
		near);
	var startZ = Math.random()*(4*far)+far;
	startPos = frustum.projectToZ(startPos, startZ);

	// random screen position
	xrange /= 2;
	yrange /= 2;
	
	var endPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/2,
		near);

	var dist = startPos.dist(endPos);
	var speed = (far-near) / 5;
	var time = dist/speed;

	var interp = Ptero.makeInterpForObjs('linear', 
		[ startPos, endPos ],
		['x','y','z'],
		[time]);

	return new Ptero.Path(interp);
};

Ptero.makeHermiteEnemyPath = function() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.screen.getFrustum();
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.far;

	var xrange = aspect*size*2;
	var yrange = size;

	var startPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange + size,
		near);
	var startZ = Math.random()*(4*far)+far;
	startPos = frustum.projectToZ(startPos, startZ);

	var midPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange,
		near);
	var midZ = near + (near + far)*0.75;
	midPos = frustum.projectToZ(midPos, midZ);

	xrange /= 2;
	yrange /= 2;
	var endPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/2,
		near);
	var endZ = near;
	endPos = frustum.projectToZ(endPos, endZ);

	// create random angles
	function randAngle() {
		var a = 50*Math.PI/180;
		return Math.random()*2*a - a;
	}
	startPos.angle = randAngle();
	midPos.angle = randAngle();
	endPos.angle = randAngle();

	// create interpolation on a time scale of 1 second
	var interp = Ptero.makeHermiteInterpForObjs(
		[ startPos, midPos, endPos ],
		['x','y','z','angle'],
		[0.5, 0.5]);

	// approximate distance of the interpolated path
	var t,dist = 0;
	var pos,prevPos;
	for (t=0; t<=1; t+=(1/1000)) {
		pos = (new Ptero.Vector).set(interp(t));
		if (prevPos) {
			dist += prevPos.dist(pos);
		}
		prevPos = pos;
	}

	// compute time to complete path
	var speed = (far-near) / 5;
	var time = dist/speed;

	// create interpolation on the desired time scale
	interp = Ptero.makeHermiteInterpForObjs(
		[ startPos, midPos, endPos ],
		['x','y','z','angle'],
		[time/2, time/2]);

	return new Ptero.Path(interp);
};

Ptero.FadeScene = function(scene1, scene2, timeToFade) {
	this.scene1 = scene1;
	this.scene2 = scene2;
	this.scene2.init();
	this.interp = Ptero.makeInterp('linear',[1,0],[timeToFade]);
	this.time = 0;
};

Ptero.FadeScene.prototype = {
	update: function(dt) {
		this.time += dt;
		if (this.time > this.interp.totalTime) {
			Ptero.scene = this.scene2;
		}
	},
	draw: function(ctx) {
		this.scene2.draw(ctx);
		ctx.globalAlpha = this.interp(this.time);
		this.scene1.draw(ctx);
		ctx.globalAlpha = 1;
	},
};

Ptero.scene_game = (function() {
	var enemies = [];
	var numEnemies = 20;



	function onKeyDown(e) {
		if (e.keyCode == 32) {
			Ptero.executive.togglePause();
		}
		else if (e.keyCode == 16) {
			Ptero.executive.slowmo();
		}
	}
	
	function onKeyUp(e) {
		if (e.keyCode == 16) {
			Ptero.executive.regmo();
		}
	}

	function init() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
		for (i=0; i<numEnemies; i++) {
			enemies.push(new Ptero.Enemy(Ptero.makeHermiteEnemyPath));
		}

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
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

	var pauseAlpha = 0;
	var pauseTargetAlpha = 0;
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
		if (Ptero.executive.isPaused()) {
			pauseTargetAlpha = 1;
		}
		else {
			pauseTargetAlpha = 0;
		}
		var img = Ptero.assets.images["pause"];
		var x = Ptero.screen.getWidth() - img.width;
		var y = Ptero.screen.getHeight() - img.height;
		pauseAlpha += (pauseTargetAlpha - pauseAlpha) * 0.3;
		ctx.globalAlpha = pauseAlpha;
		ctx.drawImage(img, x,y);
		ctx.globalAlpha = 1;
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();

Ptero.scene_fact = (function(){

	var facts = [

		'Pterosaurs ruled the skies for 155 million years.',
		'Pteros, birds, & bats evolved flight independently.',
		'Pteros ranged in size from sparrow to airplane.',
		'The largest pteros mostly glided around.',
		'Pteros had a wide range of head shapes.',
		'Ptero wings were supported by really long pinkies.',
		'Early Pterosaurs had long tails for balance.',
		'Ptero fossils were first discovered in 1784.',
		'Ptero wings were originally thought to be sea paddles.',
		'Paleontologists prefer the word "Pterosaur".',
		'One ptero fossil had a Spinosaur\'s broken tooth in it.',
		'Baby pteros are called "flaplings".',
		'Baby pteros could fly right after hatching.',
		'Pteros walked on all fours.',
		'Ptero extinction may have been caused by birds.',

		"Pteranodons attacked people in Jurassic Park III.",

	];

	var interp;
	var fact;
	var time;
	function init() {
		time = 0;
		fact = facts[Math.floor(Math.random()*facts.length)];
		interp = Ptero.makeInterp('linear', [0,1,1,0,0],[1.0,1.5,1.0,0.5]);
	}

	function update(dt) {
		if (time > interp.totalTime) {
			Ptero.fadeToScene(Ptero.scene_menu,1.0);
		}
		else {
			time += dt;
		}
	}

	function draw(ctx) {
		var w = Ptero.screen.getWidth();
		var h = Ptero.screen.getHeight();
		ctx.fillStyle = "#111";
		ctx.fillRect(0,0,w,h);
		ctx.font = "30px Arial";

		ctx.globalAlpha = interp(time);
		ctx.fillStyle = "#FFF";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText(fact, w/2,h/2);
		ctx.globalAlpha = 1.0;
	}
	
	return {
		init: init,
		update: update,
		draw: draw,
	};
})();

Ptero.scene_menu = (function(){

	var titleImg;
	var titleBoard;
	function init() {
		titleImg = Ptero.assets.images['logo'];
		titleBoard = Ptero.assets.billboards['logo'];
		Ptero.background.setImage(Ptero.assets.images.desert);
		Ptero.input.addTouchHandler(touchHandler);
		var song = Ptero.audio.getThemeSong();
		if (song) {
			song.play();
		}
	}

	var touchHandler = {
		start: function(x,y) {
			Ptero.input.removeTouchHandler(touchHandler);
			Ptero.fadeToScene(Ptero.scene_game, 1.0);
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
	}

	function draw(ctx) {
		Ptero.background.draw(ctx);
		var frustum = Ptero.screen.getFrustum();
		Ptero.painter.drawImage(ctx,titleImg,{x:0,y:frustum.nearTop/3,z:frustum.near},titleBoard);
	}

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

Ptero.audio = (function() {
	var theme;

	function init() {
		theme = new Audio();
		theme.src = "audio/theme3.mp3"
	}

	return {
		init: init,
		getThemeSong: function() { return theme; },
	};
})();
window.onload = function() {

	// Create the canvas element.
	// (CocoonJS provides a more efficient screencanvas if you're using one main canvas).
	var canvas = document.createElement(
			navigator.isCocoonJS ? 'screencanvas' : 'canvas');

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	Ptero.assets.load(function(){
		if (navigator.isCocoonJS) {
			Ptero.screen.setStartSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(canvas);
		}
		else {
			document.body.style.backgroundColor = "#222";

			var container = document.createElement('div');
			document.body.appendChild(container);
			container.appendChild(canvas);
			container.id = "canvas-container";

			var w = 720;
			var h = w/16*9;
			Ptero.screen.setStartSize(w,h);

			var border_size = 50;
			Ptero.screen.setBorderSize(border_size);
			container.style.borderWidth = border_size+"px";
			container.style.width = w + "px";
			container.style.height = h + "px";

			function center() {
				var screenW = document.body.clientWidth;
				var screenH = document.body.clientHeight;
				container.style.position = "relative";
				x = Math.max(-border_size,(screenW/2 - w/2 - border_size));
				y = Math.max(-border_size,(screenH/2 - h/2 - border_size));
				container.style.left = x+"px";
				container.style.top = y+"px";
			}
			center();
			window.addEventListener("resize", center,false);
		}
		console.log("initing audio");
		Ptero.audio.init();
		console.log("initing screen");
		Ptero.screen.init(canvas);
		console.log("initing input");
		Ptero.input.init();
		console.log("setting scene");
		Ptero.setScene(Ptero.scene_fact);
		console.log("starting exec");
		Ptero.executive.start();
	});
};
