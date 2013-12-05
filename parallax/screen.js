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
		if (aspect > 16/9) {
			windowWidth = 1280;
			windowHeight = windowWidth / aspect;
		}
		else {
			windowHeight = 720;
			windowWidth = windowHeight * aspect;
		}
		windowAspect = aspect;
		makeFrustum(16/9);
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

	// Scales the window to fit the height or width of the canvas, then centers horizontally
	function coverWindow() {
		windowScale = getWindowCoverScale();
		centerWindowAtPixel(canvasWidth/2, canvasHeight/2);
	}

	function getWindowFitScale() {
		return canvasHeight / windowHeight;
	}

	function getWindowCoverScale() {
		if (windowAspect > 16/9) {
			return canvasWidth / windowWidth;
		}
		else {
			return canvasHeight / windowHeight;
		}
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

	function resizeCanvas(w,h) {
		setCanvasSize(w,h);
		setWindowAspect(canvasAspect);
		coverWindow();
	}

	function init(_canvas,w,h) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");
		resizeCanvas(w,h);
	}

	function spaceToWindow(vector) {
		var v2 = {
			x: vector.x,
			y: vector.y,
			z: vector.z,
		};
		var v = Ptero.frustum.projectToNear(v2);
		return new Ptero.Vector(
			(v.x/Ptero.frustum.nearWidth + 0.5) * 1280 - (1280-windowWidth)/2,
			(-v.y/Ptero.frustum.nearHeight + 0.5) * 720 );
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

		resizeCanvas : resizeCanvas,

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
	};
})();

