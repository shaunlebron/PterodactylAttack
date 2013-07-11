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

	if (navigator.isCocoonJS) {
		Ptero.screen.setStartSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(canvas);
	}
	else {
		document.body.appendChild(canvas);

		var w = 720;
		var h = w/16*9;
		Ptero.screen.setStartSize(w,h);
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
	Ptero.screen.init(canvas);

	Ptero.assets.load(
		function onDone(){
			console.log('creating backgrounds');
			Ptero.createBackgrounds();
			console.log('loading high scores');
			Ptero.score.loadHighScores();
			console.log("initing audio");
			Ptero.audio.init();
			console.log("initing input");
			Ptero.input.init();
			console.log("initing background");
			Ptero.background.init();
			console.log("setting scene");
			Ptero.setScene(Ptero.scene_title);
			//Ptero.setScene(Ptero.scene_bgpos);
			console.log("starting exec");
			Ptero.executive.start();
		},
		function onProgress(percent) {
			var ctx = Ptero.screen.getCtx();
			var w = Ptero.screen.getWidth();
			var h = Ptero.screen.getHeight();

			var bw = w*0.8;
			var bh = h*0.1;

			ctx.fillStyle = "#555";
			ctx.fillRect(0,0,w,h);

			ctx.strokeStyle = ctx.fillStyle = "#000";
			ctx.lineWidth = 2;
			ctx.strokeRect(w/2-bw/2,h/2-bh/2,bw,bh);
			ctx.fillRect(w/2-bw/2,h/2-bh/2,bw*percent,bh);
		});
};
