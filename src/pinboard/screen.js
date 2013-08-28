
Ptero.Pinboard.screen = (function(){

	var canvas;

	var width =  630;
	var height = 350;

	var aspect;

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		Ptero.screen.init(canvas,width,height);
		setAspect(16,9);
	};

	function setAspect(w,h) {
		$('#16-9-btn').removeClass('active');
		$('#4-3-btn').removeClass('active');
		$('#3-2-btn').removeClass('active');
		$('#'+w+'-'+h+'-btn').addClass('active');
		var newAspect = w/h;
		aspect = w/h;
		Ptero.Pinboard.scene_pinboard.setNewAspect(aspect);
		Ptero.screen.setWindowAspect(aspect);
	};

	return {
		init: init,
		setAspect: setAspect,
		getAspect: function() { return aspect; },
		getWidth: function() { return width; },
		getHeight: function() { return height; },
	};
})();
