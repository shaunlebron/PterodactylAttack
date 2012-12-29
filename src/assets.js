
Ptero.assets = (function(){
	var sources = {
		"bg":   "img/Desert_BG.png",
		"baby": "img/baby_sheet.png",
	};

	var images = {};
	var sheets = {};

	var onLoad = function() {
		var rows,cols,frames;
		rows = 4;
		cols = 5;
		frames = 18;
		sheets.baby = new Ptero.SpriteSheet(images.baby, rows, cols, frames);
	};

	var load = function(callback) {
		var count = 0;
		for (name in sources) {
			if (sources.hasOwnProperty(name)) {
				count++;
			}
		}

		var handleLoad = function() {
			count--;
			if (count == 0) {
				onLoad();
				callback && callback();
			}
		};

		var img;
		for (name in sources) {
			if (sources.hasOwnProperty(name)) {
				img = new Image();
				img.src = sources[name];
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
