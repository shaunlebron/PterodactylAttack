
Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/Final_Desert.jpg",
		"baby": "img/baby_sheet.png",
		"boom1": "img/boom1_sheet.png",
		"boom2": "img/boom2_sheet.png",
		"bullet": "img/bullet_sheet.png",
	};

	var images = {};
	var sheets = {};

	function loadSpriteSheets() {
		var name,req,src;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				src = imageSources[name];
				if (! /_sheet/.test(src)) {
					continue;
				}
				src += ".json";

				req = new XMLHttpRequest();
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					var info = JSON.parse(req.responseText);
					sheets[name] = new Ptero.SpriteSheet(images[name], info);
				}
			}
		}
	};

	function load(callback) {
		var count = 0;
		var name;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				count++;
			}
		}

		var handleLoad = function() {
			count--;
			if (count == 0) {
				loadSpriteSheets();
				callback && callback();
			}
		};

		var img;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				img = new Image();
				img.src = imageSources[name];
				img.onload = handleLoad;
				images[name] = img;
			}
		}
	};

	return {
		load: load,
		images: images,
		sheets: sheets,
	};
})();
