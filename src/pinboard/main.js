
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
		},
	});
};
