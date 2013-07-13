
Ptero.Baklava = Ptero.Baklava || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Baklava.screen.init(canvas);

	Ptero.assets.load(
		function onDone() {
			console.log('creating backgrounds');
			Ptero.createBackgrounds();

			Ptero.Baklava.model = new Ptero.Baklava.Model();
			Ptero.Baklava.model.setMode("position");

			console.log("initing input");
			Ptero.input.init();
			console.log("initing enemy model");
			var ignoreState = true;
			if (!ignoreState && Ptero.Baklava.loader.restore()) {
				console.log("restored previous state");
			}
			else {
				console.log("creating new blank state");
			}
			console.log("setting scene");
			Ptero.setScene(Ptero.Baklava.panes);
			console.log("starting exec");
			Ptero.Baklava.executive.start();
		},
		function onProgress(percent) {
			var ctx = Ptero.screen.getCtx();
			var w = Ptero.Baklava.screen.getWidth();
			var h = Ptero.Baklava.screen.getHeight();

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
