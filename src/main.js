window.onload = function() {

	// Create the canvas element.
	// (CocoonJS provides a more efficient screencanvas if you're using one main canvas).
	var canvas = document.createElement(
			navigator.isCocoonJS ? 'screencanvas' : 'canvas');
	document.body.appendChild(canvas);

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	Ptero.assets.load(function(){
		if (navigator.isCocoonJS) {
			Ptero.screen.setStartSize(window.innerWidth, window.innerHeight);
		}
		else {
			Ptero.screen.setStartSize(720,480);
		}
		console.log("initing screen");
		Ptero.screen.init(canvas);
		console.log("initing input");
		Ptero.input.init();
		console.log("setting scene");
		Ptero.setScene(Ptero.scene_game);
		console.log("starting exec");
		Ptero.executive.start();
	});
};
