
Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/desert.png",
		"bg_frosted": "img/bg_frosted.png",
		"grass": "img/grass.png",
		"baby": "img/baby.png",
		"boom1": "img/boom1.png",
		"boom2": "img/boom2.png",
		"boom3": "img/boom3.png",
		"bullet": "img/bullet.png",
		"play": "img/play.png",
		"pause": "img/pause.png",
		"logo": "img/logo.png",
		"missile": "img/missile.png",
	};

	var levelSources = {
		"level1": "levels/level1.json",
	};

	var images = {};
	var sprites = {};
	var tables = {};
	var mosaics = {};
	var levels = {};

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
	};

	function retrieveMetaData() {
		var name,req,src,metadata;
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				src = imageSources[name] + ".json";
				console.log(src);
				req = new XMLHttpRequest();
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					metadata = JSON.parse(req.responseText);
				}
				parseMetaData(name, metadata);
			}
		}
	};

	function load(onDone,onProgress) {
		var count = 0;
		var totalCount = 0;
		var name;
		onProgress && onProgress(0);
		for (name in imageSources) {
			if (imageSources.hasOwnProperty(name)) {
				totalCount++;
			}
		}
		for (name in levelSources) {
			if (levelSources.hasOwnProperty(name)) {
				totalCount++;
			}
		}

		var handleLoad = function() {
			count++;
			if (count == totalCount) {
				retrieveMetaData();
				onDone && onDone();
			}
			onProgress && onProgress(count/totalCount);
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
		for (name in levelSources) {
			if (levelSources.hasOwnProperty(name)) {
				var src = levelSources[name];
				var req = new XMLHttpRequest();
				req.onload = function() {
					if (req.status == 200) {
						levels[name] = JSON.parse(req.responseText);
						console.log("got level:",name);
					}
					handleLoad();
				}
				req.open('GET', src, true);
				req.send();
			}
		}
	};

	function keepExplosionsCached(ctx) {
		// This seems to prevents the sporadic drawing of explosions from creating hiccups in the framerate.
		// This method works by trying to keep the textures loaded in whatever internal cache the Chrome browser uses for drawing textures.
		// We try to draw it in the smallest surface area possible.
		var s = 10;
		ctx.drawImage(Ptero.assets.images["boom1"],0,0,s,s);
		ctx.drawImage(Ptero.assets.images["boom2"],0,0,s,s);
		ctx.drawImage(Ptero.assets.images["boom3"],0,0,s,s);
	}

	return {
		load: load,
		images: images,
		sprites: sprites,
		tables: tables,
		mosaics: mosaics,
		levels: levels,
		keepExplosionsCached: keepExplosionsCached,
	};
})();
