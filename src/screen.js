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
		var near = height/2 / Math.tan(fov/2);
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

    var getScreenToSpaceRatio = function() {
        return (width) / frustum.nearWidth;
    };

	var getCanvasPos = function() {
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

