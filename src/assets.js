
Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/Final_Desert.jpg",
		"baby": "img/baby_sheet.png",
		"boom1": "img/boom1small_sheet.png",
		"boom2": "img/boom2small_sheet.png",
		"boom3": "img/boom3_sheet.png",
		"bullet": "img/bullet_sheet.png",
	};

	var imageScales = {
		"baby": 2.0,
		"boom1": 2.0/1000*2720,
		"boom2": 2.0/1000*3500,
		"boom3": 4.0,
	};

	var images = {};
	var sheets = {};
	var billboards = {};

	function makeBillboards() {
		var x,y,w,h,scale,sheet,img,board;
		for (name in imageSources) {
			sheet = img = null;
			if (sheets.hasOwnProperty(name)) {
				sheet = sheets[name];
				x = sheet.tileCenterX;
				y = sheet.tileCenterY;
				w = sheet.tileWidth;
				h = sheet.tileHeight;
			}
			else if (images.hasOwnProperty(name)) {
				img = images[name];
				w = img.width;
				h = img.height;
				x = w/2;
				y = h/2;
			}
			else {
				continue;
			}
			board = new Ptero.Billboard(x,y,w,h,imageScales[name]);
			if (sheet) {
				sheet.billboard = board;
			}
			billboards[name] = board;
		}
	};

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
				makeBillboards();
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
		billboards: billboards,
	};
})();
