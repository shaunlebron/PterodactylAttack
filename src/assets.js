
Ptero.assets = (function(){

	var imageInfo = {
		"desert": {
			src: "img/Final_Desert.jpg",
			scale: 1.0,
		},
		"grass": {
			src: "img/grass.png",
			metadata: true,
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
	var tables = {};
	var mosaics = {};
	var billboards = {};

	function makeBillboards() {
		var x,y,w,h,table,sprite,img,board;
		for (name in imageInfo) {
			table = img = null;
			if (tables.hasOwnProperty(name)) {
				table = tables[name];
				x = table.tileCenterX;
				y = table.tileCenterY;
				w = table.tileWidth;
				h = table.tileHeight;
			}
			else if (sprites.hasOwnProperty(name)) {
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
			if (table) {
				table.billboard = board;
			}
			else {
				sprite.billboard = board;
			}
			billboards[name] = board;
		}
	};

	function parseMetaData(name, meta) {
		if (meta.rows != undefined) {
			console.log("creating table",name);
			tables[name] = new Ptero.SpriteTable(images[name], meta);
		}
		else if (meta.mosaic != undefined) {
			console.log("creating mosaic",name);
			mosaics[name] = new Ptero.SpriteMosaic(images[name], meta);
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
		tables: tables,
		mosaics: mosaics,
		billboards: billboards,
	};
})();
