
Ptero.Pinboard = Ptero.Pinboard || {};

window.onload = function() {

	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Pinboard.screen.init(canvas);

	Ptero.assets.load({
		loadingImageName: 'title',
		onStart: function() {
			console.log('starting loading scene');
			Ptero.setScene(Ptero.Pinboard.scene_loading);
			Ptero.Pinboard.executive.start();
		},
		onDone: function() {
			console.log('creating backgrounds');
			Ptero.createBackgrounds();

			$(document).keydown(function(e){
				if (e.which == 90 && e.ctrlKey) {
					Ptero.Pinboard.scene_pinboard.undo();
				}
				else if (e.which == 89 && e.ctrlKey) {
					Ptero.Pinboard.scene_pinboard.redo();
				}
			});

			(function() {
				var str="";
				var name;
				for (name in Ptero.assets.fonts) {
					str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.setSelectedFont('" + name + "')\" href=\"#\">" + name + "</a></li>";
				}
				$('#fontMenu').html(str);
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

			console.log("setting scene");
			Ptero.setScene(Ptero.Pinboard.scene_pinboard);

			var ignoreState = false;
			if (!ignoreState && Ptero.Pinboard.loader.restore()) {
				console.log("restored previous state");
			}
			else {
				console.log("creating new blank state");
				Ptero.Pinboard.loader.reset();
			}
		},
	});
};
