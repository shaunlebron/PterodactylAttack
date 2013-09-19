Ptero.screen = (function(){

	// Size of the canvas in pixels.
	var canvasWidth;
	var canvasHeight;
	var canvasAspect;

	// The window is the virtual surface the game is drawn inside.
	// The window will be scaled and positioned to fit screens of different sizes.

	// window position in canvas pixels
	var windowLeft;
	var windowTop;

	// the scale that the window will be drawn inside the canvas.
	var windowScale;

	// the window has a base height of 720 units, and its width is determined by the set aspect.
	var windowAspect;
	var windowWidth;
	var windowHeight = 720;

	function transformToWindow() {
		ctx.transform(1,0,0,1,0,0);
		ctx.translate(windowLeft, windowTop);
		ctx.scale(windowScale, windowScale);
	}

	var canvas,ctx;

	// if the HTML Canvas in the DOM has a border around it, this variable helps us keep accurate click coordinates.
	var borderSize;

	function setCanvasSize(w,h) {
		canvas.width = canvasWidth = w;
		canvas.height = canvasHeight = h;
		canvasAspect = w / h;
	}

	function makeFrustum(aspect) {
		var fov = 30*Math.PI/180;
		var near = 1;
		var far = near*20;
		Ptero.frustum = new Ptero.Frustum(near,far,fov,aspect);

		Ptero.frustum.scale = windowHeight / Ptero.frustum.nearHeight;
	}

	function setWindowAspect(aspect) {
		var oldWidth = windowWidth;
		windowAspect = aspect;
		windowWidth = windowHeight * aspect;
		makeFrustum(aspect);
		if (windowLeft != undefined) {
			windowLeft += (oldWidth-windowWidth)/2  * windowScale;
		}
	}

	function centerWindowAtPixel(x,y) {
		windowLeft = x - windowWidth/2  * windowScale;
		windowTop  = y - windowHeight/2 * windowScale;
	}

	// Scales the window to fit the height of the canvas, then centers horizontally
	function fitWindow() {
		windowScale = getWindowFitScale();
		centerWindowAtPixel(canvasWidth/2, canvasHeight/2);
	}

	function getWindowFitScale() {
		return canvasHeight / windowHeight;
	}

	function zoomWindow(scale, cx, cy) {
		var w = canvasToWindow(cx,cy);
		windowScale = scale;
		windowLeft = cx - w.x*windowScale;
		windowTop  = cy - w.y*windowScale;
	}

	function clipWindow() {
		ctx.beginPath();
		ctx.rect(0,0,windowWidth,windowHeight);
		ctx.clip();
	}

	function init(_canvas,w,h) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		setCanvasSize(w,h);
		setWindowAspect(canvasAspect);
		fitWindow();

		initShake();
	}

	// Screen-shaking
	var shakeTime = 0;
	var shakeMaxTime = 1;
	var shakeOffset = 0;
	var shakeRadius;
	function initShake() {
		shakeRadius = Ptero.frustum.nearTop/16;
	}
	function shake() {
		shakeTime = shakeMaxTime;
	}
	var shakeSign = 1;
	function updateShake(dt) {
		shakeTime = Math.max(0, shakeTime - dt);
		var cycles = 10;
		var t = shakeTime/shakeMaxTime * Math.PI * 2 * 10;
		var mag = shakeTime/shakeMaxTime;
		shakeOffset = Math.sin(t) * mag * shakeRadius;
	}

	function spaceToWindow(vector) {
		var v2 = {
			x: vector.x + shakeOffset,
			y: vector.y,
			z: vector.z,
		};
		var v = Ptero.frustum.projectToNear(v2);
		return new Ptero.Vector(
			(v.x/Ptero.frustum.nearWidth + 0.5) * windowWidth,
			(-v.y/Ptero.frustum.nearHeight + 0.5) * windowHeight);
	}

	function windowToSpace(vector) {
		return new Ptero.Vector(
			(vector.x/windowWidth - 0.5) * Ptero.frustum.nearWidth,
			-(vector.y/windowHeight - 0.5) * Ptero.frustum.nearHeight,
			Ptero.frustum.near);
	}

	function canvasToWindow(cx,cy) {
		return {
			x: (cx - windowLeft) / windowScale,
			y: (cy - windowTop) / windowScale,
		};
	}

	function windowToCanvas(wx,wy) {
		return {
			x: windowLeft + wx*windowScale,
			y: windowTop  + wy*windowScale,
		};
	}

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
	}

	function update(dt) {
		updateShake(dt);
	}

	return {
		init: init,

		getCanvas:	function() { return canvas; },
		getCtx:		function() { return ctx; },

		setBorderSize: function(s) { borderSize = s; },

		getCanvasWidth  : function() { return canvasWidth; },
		getCanvasHeight : function() { return canvasHeight; },
		getCanvasAspect : function() { return canvasAspect; },

		getWindowWidth  : function() { return windowWidth; },
		getWindowHeight : function() { return windowHeight; },
		getWindowAspect : function() { return windowAspect; },

		spaceToWindow  : spaceToWindow,
		windowToSpace  : windowToSpace,
		canvasToWindow : canvasToWindow,
		windowToCanvas : windowToCanvas,

		getCanvasPos: getCanvasPos,

		transformToWindow: transformToWindow,
		setWindowAspect: setWindowAspect,
		fitWindow: fitWindow,
		getWindowFitScale: getWindowFitScale,
		clipWindow: clipWindow,
		centerWindowAtPixel: centerWindowAtPixel,
		zoomWindow: zoomWindow,

		getTopLeftScreenCornerInWindowCoords: function() {
			return {
				x: -windowLeft/windowScale,
				y: -windowTop/windowScale,
			};
		},

		getWindowPos: function() {
			return {
				x: windowLeft,
				y: windowTop,
			};
		},
		getWindowScale: function() {
			return windowScale;
		},
		setWindowPos: function(cx,cy) {
			windowLeft = cx;
			windowTop = cy;
		},
		setWindowScale: function(s) {
			windowScale = s;
		},

		update: update,

		shake: shake,
	};
})();

