
Ptero.Fourier.screen = (function(){

	var canvas;

	var paneWidth = 800;
	var paneHeight = paneWidth/16*9;

	var timePaneHeight = 100;

	var width =  paneWidth;
	var height = paneHeight + timePaneHeight;

	var aspect;

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		Ptero.screen.setStartSize(paneWidth,paneHeight);
		Ptero.screen.init(canvas);
		canvas.width = width;
		canvas.height = height;
		//setAspect(16,9);
	};

	function setAspect(w,h) {
		$('#16-9-btn').removeClass('active');
		$('#4-3-btn').removeClass('active');
		$('#3-2-btn').removeClass('active');
		$('#'+w+'-'+h+'-btn').addClass('active');
		aspect = w/h;

		var f = Ptero.screen.getFrustum();
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
		getTimePaneHeight: function() { return timePaneHeight; },
	};
})();
