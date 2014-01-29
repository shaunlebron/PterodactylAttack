
Ptero.Baklava.screen = (function(){

	var canvas;

	var paneWidth = 315;
	var paneHeight = paneWidth/16*9;

	var width =  paneWidth*2;
	var height = paneHeight*3;

	var aspect;

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		Ptero.screen.init(canvas,2*paneWidth,2*paneHeight);
		canvas.width = width;
		canvas.height = height;
		setAspect(16,9);
	};

	function setAspect(w,h) {
		$('#16-9-btn').removeClass('active');
		$('#4-3-btn').removeClass('active');
		$('#3-2-btn').removeClass('active');
		$('#'+w+'-'+h+'-btn').addClass('active');
		aspect = w/h;

		var f = Ptero.frustum;
		var x = f.nearHeight * aspect / 2;
		f.nearRightA = x;
		f.nearLeftA = -x;
		x = f.farHeight * aspect / 2;
		f.farRightA = x;
		f.farLeftA = -x;
	};

	return {
		init: init,
		setAspect: setAspect,
		getAspect: function() { return aspect; },
		getWidth: function() { return width; },
		getHeight: function() { return height; },
		getPaneWidth: function() { return paneWidth; },
		getPaneHeight: function() { return paneHeight; },
	};
})();
