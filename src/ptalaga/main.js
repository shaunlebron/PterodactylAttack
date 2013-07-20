
Ptero.Ptalaga = Ptero.Ptalaga || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Ptalaga.screen.init(canvas);

	Ptero.assets.load(
		function onDone() {
			console.log('creating backgrounds');
			Ptero.createBackgrounds();

			console.log('populating enemy type menu');

			(function() {
				var enemyType;
				var str="";
				for (enemyType in Ptero.enemyTypes) {
					str += "<li><a onclick=\"Ptero.Ptalaga.enemy_model.setType('" + enemyType + "')\" href=\"#\">" + enemyType + "</a></li>";
				}
				$('#enemyTypeMenu').html(str);
			})();

			(function() {
				var bgType;
				var str="";
				for (bgType in Ptero.backgrounds) {
					str += "<li><a onclick=\"Ptero.setBackground('" + bgType + "')\" href=\"#\">" + bgType + "</a></li>";
				}
				$('#bgTypeMenu').html(str);
			})();


			console.log("initing input");
			Ptero.input.init();
			console.log("initing enemy model");
			Ptero.Ptalaga.enemy_model_list = new Ptero.Ptalaga.EnemyModelList();

			$(document).keydown(function(e){
				if (e.which == 90 && e.ctrlKey) {
					Ptero.Ptalaga.enemy_model_list.undo();
				}
				else if (e.which == 89 && e.ctrlKey) {
					Ptero.Ptalaga.enemy_model_list.redo();
				}
			});

			var ignoreState = false;
			if (!ignoreState && Ptero.Ptalaga.loader.restore()) {
				console.log("restored previous state");
			}
			else {
				console.log("creating new blank state");
				Ptero.Ptalaga.loader.reset();
			}

			Ptero.Ptalaga.enemy_model_list.play();
			window.addEventListener("keydown", function(e) {
				if (e.keyCode == 32) {
					e.preventDefault();
					Ptero.Ptalaga.enemy_model_list.togglePlay();
				}
				else if (e.keyCode == 80) {
					Ptero.Ptalaga.enemy_model_list.togglePreview();
				}
			});

			console.log("setting scene");
			Ptero.setScene(Ptero.Ptalaga.panes);
			console.log("starting exec");
			Ptero.Ptalaga.executive.start();
		},
		function onProgress(percent) {
			var ctx = Ptero.screen.getCtx();
			var w = Ptero.Ptalaga.screen.getWidth();
			var h = Ptero.Ptalaga.screen.getHeight();

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
