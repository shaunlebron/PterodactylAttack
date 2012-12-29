Ptero.screen = (function(){
	var width;
	var height;
	var aspect;
	var fov = 60*Math.PI/180;
	var near = 1;
	var far = 100;
	var canvas,ctx;

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
	};

	return {
		init: init,
		getWidth:	function() { return width; },
		getHeight:  function() { return height; },
		getAspect:  function() { return aspect; },
		getFov:		function() { return fov; },
		getNear:    function() { return near; },
		getFar:		function() { return far; },
		getCanvas:	function(){ return canvas; },
		getCtx:		function(){ return ctx; },
	};
})();

