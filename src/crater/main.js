
Ptero.Crater = Ptero.Crater || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Crater.screen.init(canvas);

	Ptero.assets.load(
		function onDone() {
			console.log("initing input");
			Ptero.input.init();
			console.log("initing background");
			Ptero.background.init();
			console.log("initing enemy model");
			Ptero.Crater.enemy_model_list = new Ptero.Crater.EnemyModelList();
			var ignoreState = false;
			if (!ignoreState && Ptero.Crater.loader.restore()) {
				console.log("restored previous state");
			}
			else {
				console.log("creating new blank state");
				Ptero.Crater.loader.reset();
			}
			console.log("setting scene");
			Ptero.setScene(Ptero.Crater.panes);
			console.log("starting exec");
			Ptero.Crater.executive.start();
		},
		function onProgress(percent) {
			var ctx = Ptero.screen.getCtx();
			var w = Ptero.Crater.screen.getWidth();
			var h = Ptero.Crater.screen.getHeight();

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
