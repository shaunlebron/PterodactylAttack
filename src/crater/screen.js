
Ptero.Crater.screen = (function(){

	var canvas;

	var paneWidth = 400;
	var paneHeight = paneWidth/16*9;

	var timePaneHeight = 80;
	var rotPaneHeight = 100;

	var width =  paneWidth*2;
	var height = paneHeight*2 + timePaneHeight + rotPaneHeight;

	function init(_canvas) {
		canvas = _canvas;
		ctx = canvas.getContext("2d");

		Ptero.screen.setStartSize(paneWidth,paneHeight);
		Ptero.screen.init(canvas);
		canvas.width = width;
		canvas.height = height;
	};

	return {
		init: init,
		getPaneWidth: function() { return paneWidth; },
		getPaneHeight: function() { return paneHeight; },
		getTimePaneHeight: function() { return timePaneHeight; },
		getRotPaneHeight: function() { return rotPaneHeight; },
	};
})();
