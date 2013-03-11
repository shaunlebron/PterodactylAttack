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

	Ptero.assets.load(function(){
		if (navigator.isCocoonJS) {
			Ptero.screen.setStartSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(canvas);
		}
		else {
			document.body.style.backgroundColor = "#222";

			var container = document.createElement('div');
			document.body.appendChild(container);
			container.appendChild(canvas);
			container.id = "canvas-container";

			var w = 720;
			var h = w/16*9;
			Ptero.screen.setStartSize(w,h);

			var border_size = 50;
			Ptero.screen.setBorderSize(border_size);
			container.style.borderWidth = border_size+"px";
			container.style.width = w + "px";
			container.style.height = h + "px";

			function center() {
				var screenW = document.body.clientWidth;
				var screenH = document.body.clientHeight;
				container.style.position = "relative";
				x = Math.max(-border_size,(screenW/2 - w/2 - border_size));
				y = Math.max(-border_size,(screenH/2 - h/2 - border_size));
				container.style.left = x+"px";
				container.style.top = y+"px";
			}
			center();
			window.addEventListener("resize", center,false);
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
