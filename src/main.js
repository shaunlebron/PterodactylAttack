window.onload = function() {

	// Create the canvas element.
	// (CocoonJS provides a more efficient screencanvas if you're using one main canvas).
	var canvas = document.createElement(
			navigator.isCocoonJS ? 'screencanvas' : 'canvas');

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	var w,h;
	if (navigator.isCocoonJS) {
		w = window.innerWidth;
		h = window.innerHeight;
		document.body.appendChild(canvas);
	}
	else {
		document.body.appendChild(canvas);

		w = 720;
		h = w/16*9;
		var body = document.getElementsByTagName("body")[0];

		function center() {
			var screenW = document.body.clientWidth;
			var screenH = document.body.clientHeight;
			canvas.style.position = "relative";
			x = Math.max(0,(screenW/2 - w/2));
			y = Math.max(0,(screenH/2 - h/2));
			canvas.style.left = x+"px";
			canvas.style.top = y+"px";
			body.style.backgroundPosition = (x-132)+"px " + (y-35)+"px";
		}
		center();
		window.addEventListener("resize", center,false);
	}

	console.log("initing screen");
	Ptero.screen.init(canvas,w,h);

	Ptero.assets.load({
		loadingImageName: 'title',
		onStart: function() {
			console.log('starting loading scene');
			Ptero.setScene(Ptero.scene_loading);
			Ptero.executive.start();
		},
		onDone: function() {
			console.log('creating backgrounds');
			Ptero.createBackgrounds();
			console.log('loading high score');
			Ptero.score.loadHighScore();
			console.log("initing audio");
			Ptero.audio.init();
			console.log("initing input");
			Ptero.input.init();
			console.log("setting scene");
			Ptero.setScene(Ptero.scene_title);
		},
	});
};
