
Ptero.Crater.screen = (function(){

	var canvas;

	var sectionWidth = 400;
	var sectionHeight = 200;
	var width = sectionWidth*2;
	var height = sectionHeight*2;

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		Ptero.screen.setStartSize(sectionWidth, sectionHeight);
		Ptero.screen.init(canvas);
		canvas.width = width;
		canvas.height = height;
	};

	return {
		init: init,
	};
})();
