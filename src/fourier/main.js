
Ptero.Fourier = Ptero.Fourier || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.getElementById('canvas');

	console.log("initing screen");
	Ptero.Fourier.screen.init(canvas);

	Ptero.assets.load({
		loadingImageName: 'title',
		onStart: function() {
			console.log('starting loading scene');
			Ptero.setScene(Ptero.Fourier.scene_loading);
			Ptero.Fourier.executive.start();
		},
		onDone: function() {

			console.log('creating backgrounds');
			Ptero.createBackgrounds();

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
			console.log("initing audio");
			Ptero.audio.init();
			console.log("initing wave list");
			Ptero.Fourier.wave_list = new Ptero.Fourier.WaveList();
			var ignoreState = false;
			if (!ignoreState && Ptero.Fourier.loader.restore()) {
				console.log("restored previous state");
			}
			else {
				console.log("creating new blank state");
				Ptero.Fourier.loader.reset();
			}
			console.log("setting scene");
			Ptero.setScene(Ptero.Fourier.panes);
		},
	});
};
