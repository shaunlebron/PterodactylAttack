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

		var fov = 60*Math.PI/180;
		var near = 1;
		var far = 100;
		frustum = new Ptero.frustum(near,far,fov,aspect);

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
		getFov:		function() { return fov; },
		getNear:    function() { return near; },
		getFar:		function() { return far; },
		getCanvas:	function() { return canvas; },
		getCtx:		function() { return ctx; },
		getFrustum: function() { return frustum; },
		spaceToScreen: spaceToScreen,
		screenToSpace: screenToSpace,
	};
})();

