
Ptero.assets = (function(){

	var imageInfo = {
		"desert": {
			src: "img/Final_Desert.jpg",
			scale: 1.0,
		},
		"baby": {
			src: "img/baby.png",
			metadata: true,
			scale: 2.0,
		},
		"boom1": {
			src: "img/boom1.png",
			metadata: true,
			scale: 2.0,
		},
		"boom2": {
			src: "img/boom2.png",
			metadata: true,
			scale: 2.0,
		},
		"boom3": {
			src: "img/boom3.png",
			metadata: true,
			scale: 4.0,
		},
		"bullet": {
			src: "img/bullet.png",
			scale: 1.0,
		},
		"pause": {
			src: "img/pause.png",
			scale: 1.0,
		},
		"logo": {
			src: "img/LogoVivid.png",
			scale: 0.8,
		},
	};

	var images = {};
	var sprites = {};
	var sheets = {};
	var billboards = {};

	function makeBillboards() {
		var x,y,w,h,sheet,sprite,img,board;
		for (name in imageInfo) {
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
				sprite = sprites[name];
				x = sprite.centerX;
				y = sprite.centerY;
				w = img.width;
				h = img.height;
			}
			else {
				continue;
			}
			board = new Ptero.Billboard(x,y,w,h,imageInfo[name].scale);
			if (sheet) {
				sheet.billboard = board;
			}
			else {
				sprite.billboard = board;
			}
			billboards[name] = board;
		}
	};

	function parseMetaData(name, meta) {
		if (meta.rows != undefined) {
			console.log("creating sheet",name);
			sheets[name] = new Ptero.SpriteSheet(images[name], meta);
		}
		else {
			console.log("creating sprite",name);
			sprites[name] = new Ptero.Sprite(images[name], meta);
		}

		if (meta.scale != undefined) {
			if (imageInfo[name].scale != undefined) {
				imageInfo[name].scale *= meta.scale;
			}
			else {
				imageInfo[name].scale = meta.scale;
			}
		}
	};

	function retrieveMetaData() {
		var name,req,src,metadata;
		for (name in imageInfo) {
			if (imageInfo.hasOwnProperty(name)) {
				metadata = {};
				if (imageInfo[name].metadata) {
					src = imageInfo[name].src + ".json";
					req = new XMLHttpRequest();
					req.open('GET', src, false);
					req.send();
					if (req.status == 200) {
						metadata = JSON.parse(req.responseText);
					}
				}
				parseMetaData(name, metadata);
			}
		}
	};

	function load(callback) {
		var count = 0;
		var name;
		for (name in imageInfo) {
			if (imageInfo.hasOwnProperty(name)) {
				count++;
			}
		}

		var handleLoad = function() {
			count--;
			if (count == 0) {
				retrieveMetaData();
				makeBillboards();
				callback && callback();
			}
		};

		var img;
		for (name in imageInfo) {
			if (imageInfo.hasOwnProperty(name)) {
				img = new Image();
				img.src = imageInfo[name].src;
				img.onload = handleLoad;
				images[name] = img;
			}
		}
	};

	return {
		load: load,
		images: images,
		sprites: sprites,
		sheets: sheets,
		billboards: billboards,
	};
})();
