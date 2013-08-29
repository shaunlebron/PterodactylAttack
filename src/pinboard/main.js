
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

			(function() {
				var bgType;
				var str="";
				str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.selectImage(null)\" href=\"#\">(empty image)</a></li>";
				var images = [
					"backplate_mountain",
					"backplate_ice",
					"net",
					"button_plank",
					"menu_wrench",
					"menu_strong",
					"menu_scroll",
					"btn_back",
				];
				var i,len=images.length;
				for (i=0; i<len; i++) {
					str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.selectImage('" + images[i] + "')\" href=\"#\">" + images[i] + "</a></li>";
				}
				$('#imageMenu').html(str);
			})();

			console.log("initing input");
			Ptero.input.init();

			console.log("setting scene");
			Ptero.setScene(Ptero.Pinboard.scene_pinboard);
		},
	});
};
