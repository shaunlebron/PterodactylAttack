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

