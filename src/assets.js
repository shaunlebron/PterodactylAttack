
Ptero.assets = (function(){

	var imageSources = {
		"desert": "img/desert.png",
		"bgLayers": "img/bgLayers.png",
		"bgLayersDesat": "img/bgLayersDesat.png",
		"bgLayersWash": "img/bgLayersWash.png",
		"bg_frosted": "img/bg_frosted.png",
		"grass": "img/grass.png",
		"baby": "img/baby.png",
		"adult": "img/adult.png",
		"boom1": "img/boom1.png",
		"boom2": "img/boom2.png",
		"boom3": "img/boom3.png",
		"bullet": "img/bullet.png",
		"play": "img/play.png",
		"pause": "img/pause.png",
		"logo": "img/logo.png",
		"missile": "img/missile.png",
		"timertype": "img/timertype.png",
		"scoretype": "img/scoretype.png",
		"swipe": "img/swipe.png",
		"baby_green": "img/baby_green.png",
		"baby_pink": "img/baby_pink.png",
		"baby_purple": "img/baby_purple.png",
		"baby_teal": "img/baby_teal.png",
		"baby_yellow": "img/baby_yellow.png",
		"adult_green": "img/adult_green.png",
		"adult_greenspot": "img/adult_greenspot.png",
		"adult_pink": "img/adult_pink.png",
		"adult_purple": "img/adult_purple.png",
		"adult_red": "img/adult_red.png",
		"adult_redspot": "img/adult_redspot.png",
		"adult_yellow": "img/adult_yellow.png",
		"adult_yellowstripe": "img/adult_yellowstripe.png",
		"health": "img/health.png",
	};

	if (!navigator.isCocoonJS) {
		imageSources["bg_mountain"] = "img/bg_mountain.svg";
	}

	var levelSources = {
		"level1": "levels/level1.json",
		"fourier": "levels/fourier-level",
		"survival01": "levels/survival01.json",
		"survival02": "levels/survival02.json",
		"survival03": "levels/survival03.json",
	};

	var miscJsonSources = {
		"bgLayerDepths": "img/bgLayerDepths.json",
		"mainmenu_paths": "paths/mainmenu.json",
		"difficulty_paths": "paths/difficulty.json",
		"highscores_paths": "paths/highscores.json",
	};

	var json = {};

	var images = {};
	var vectorSprites = {};
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
		else if (meta.vector) {
			console.log('creating vector', name, 'for desktop');
			vectorSprites[name] = new Ptero.Sprite(images[name], meta);
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
		for (name in miscJsonSources) {
			if (miscJsonSources.hasOwnProperty(name)) {
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
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					levels[name] = JSON.parse(req.responseText);
					console.log("got level: "+ name);
				}
				else {
					console.error("could not load: "+ name);
				}
				handleLoad();
			}
		}
		for (name in miscJsonSources) {
			if (miscJsonSources.hasOwnProperty(name)) {
				var src = miscJsonSources[name];
				var req = new XMLHttpRequest();
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					json[name] = JSON.parse(req.responseText);
					console.log("got misc: "+ name);
				}
				else {
					console.error("could not load: "+ name);
				}
				handleLoad();
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

	function makeAnimSprite(name) {

		var table = Ptero.assets.tables[name];
		var mosaic = Ptero.assets.mosaics[name];

		var spriteData = {};
		if (table) {
			spriteData.table = table;
		}
		else if (mosaic) {
			spriteData.mosaic = mosaic;
		}

		return new Ptero.AnimSprite(spriteData);
	}

	return {
		json: json,
		load: load,
		images: images,
		vectorSprites: vectorSprites,
		sprites: sprites,
		tables: tables,
		mosaics: mosaics,
		levels: levels,
		makeAnimSprite: makeAnimSprite,
		keepExplosionsCached: keepExplosionsCached,
	};
})();
