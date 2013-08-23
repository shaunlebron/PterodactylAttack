Ptero.screen = (function(){

	var width;
	var height;
	var aspect;
	var scale;

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

	function establishScale() {
		var baseW = 1280;
		var baseH = 720;
		var baseAspect = baseW / baseH;
		var scaleH = height / baseH;
		var scaleW = width / baseW;
		scale = (baseAspect > aspect) ? scaleH : scaleW;
	};

	var shakeTime = 0;
	var shakeMaxTime = 1;
	var shakeOffset = 0;
	var shakeRadius;
	function shake() {
		shakeTime = shakeMaxTime;
	};

	function init(_canvas,w,h) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		setSize(w,h);
		establishScale();

		var fov = 30*Math.PI/180;
		//var near = height/2 / Math.tan(fov/2);
		var near = 1;
		var far = near*20;
		Ptero.frustum = frustum = new Ptero.Frustum(near,far,fov,aspect);
		shakeRadius = frustum.nearTop/16;

		Ptero.sizeFactor = frustum.nearTop;
	};

	var shakeSign = 1;
	function update(dt) {
		shakeTime = Math.max(0, shakeTime - dt);
		updateShake();
	};

	function updateShake() {
		var cycles = 10;
		var t = shakeTime/shakeMaxTime * Math.PI * 2 * 10;
		var mag = shakeTime/shakeMaxTime;
		shakeOffset = Math.sin(t) * mag * shakeRadius;
	};

	// Determine screen coordinates from a point in the frustum.
	function spaceToScreen(vector) {
		var v2 = {
			x: vector.x + shakeOffset,
			y: vector.y,
			z: vector.z,
		};
		var v = frustum.projectToNear(v2);
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

	function screenFracToSpace(xf,yf) {
		return screenToSpace({
			x: xf * width,
			y: yf * height,
		});
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
		getScale:   function() { return scale; },
		getCanvas:	function() { return canvas; },
		getCtx:		function() { return ctx; },
		spaceToScreen: spaceToScreen,
		screenToSpace: screenToSpace,
		screenFracToSpace: screenFracToSpace,
        getScreenToSpaceRatio: getScreenToSpaceRatio,
		getCanvasPos: getCanvasPos,
		update: update,
		updateShake: updateShake,
		shake: shake,
	};
})();

