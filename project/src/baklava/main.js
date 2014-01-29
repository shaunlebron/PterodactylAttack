
Ptero.Baklava = Ptero.Baklava || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Baklava.screen.init(canvas);

	console.log('starting loading scene');
	Ptero.setScene(Ptero.scene_loading);
	Ptero.Baklava.executive.start();

	Ptero.assets.load(function(){
		console.log('creating backgrounds');
		Ptero.createBackgrounds();

		(function() {
			var bgType;
			var str="";
			for (bgType in Ptero.backgrounds) {
				str += "<li><a onclick=\"Ptero.Baklava.model.setBackground('" + bgType + "')\" href=\"#\">" + bgType + "</a></li>";
			}
			$('#bgTypeMenu').html(str);
		})();

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
	});
};
