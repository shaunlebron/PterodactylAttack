
Ptero.assets = (function(){

	var imageSources = {
		"boom1": "img/boom1.png",
		"boom2": "img/boom2.png",
		"boom3": "img/boom3.png",

		"bullet": "img/bullet.png",

		"play"      : "img/play.png",
		"pause"     : "img/pause.png",
		"logo"      : "img/logo.png",
		"timertype" : "img/timertype.png",
		"scoretype" : "img/scoretype.png",
		"swipe"     : "img/swipe.png",
		"health"    : "img/health.png",

		"baby"        : "img/pteros/baby.png",
		"baby_green"  : "img/pteros/baby_green.png",
		"baby_pink"   : "img/pteros/baby_pink.png",
		"baby_purple" : "img/pteros/baby_purple.png",
		"baby_teal"   : "img/pteros/baby_teal.png",
		"baby_yellow" : "img/pteros/baby_yellow.png",

		"adult"              : "img/pteros/adult.png",
		"adult_green"        : "img/pteros/adult_green.png",
		"adult_greenspot"    : "img/pteros/adult_greenspot.png",
		"adult_pink"         : "img/pteros/adult_pink.png",
		"adult_purple"       : "img/pteros/adult_purple.png",
		"adult_red"          : "img/pteros/adult_red.png",
		"adult_redspot"      : "img/pteros/adult_redspot.png",
		"adult_yellow"       : "img/pteros/adult_yellow.png",
		"adult_yellowstripe" : "img/pteros/adult_yellowstripe.png",

		"bg_mountain_00": "img/bg_mountain/00.svg",
		"bg_mountain_01": "img/bg_mountain/01.svg",
		"bg_mountain_02": "img/bg_mountain/02.svg",
		"bg_mountain_03": "img/bg_mountain/03.svg",
		"bg_mountain_04": "img/bg_mountain/04.svg",
		"bg_mountain_05": "img/bg_mountain/05.svg",
		"bg_mountain_06": "img/bg_mountain/06.svg",
		"bg_mountain_07": "img/bg_mountain/07.svg",
		"bg_mountain_08": "img/bg_mountain/08.svg",
		"bg_mountain_09": "img/bg_mountain/09.svg",
		"bg_mountain_10": "img/bg_mountain/10.svg",
		"bg_mountain_11": "img/bg_mountain/11.svg",
		"bg_mountain_12": "img/bg_mountain/12.svg",
		"bg_mountain_13": "img/bg_mountain/13.svg",
		"bg_mountain_14": "img/bg_mountain/14.svg",
		"bg_mountain_15": "img/bg_mountain/15.svg",
		"bg_mountain_16": "img/bg_mountain/16.svg",
		"bg_mountain_17": "img/bg_mountain/17.svg",
	};

	var levelSources = {
		"level1": "levels/level1.json",
		"fourier": "levels/fourier-level",
		"survival01": "levels/survival01.json",
		"survival02": "levels/survival02.json",
		"survival03": "levels/survival03.json",
	};

	var miscJsonSources = {

		"bg_mountain_layers": "img/bg_mountain/layers.json",

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
			console.log('creating vector', name);
			if (navigator.isCocoonJS) {
				var src = imageSources[name] + ".js";
				console.log(src);
				var req = new XMLHttpRequest();
				req.open('GET', src, false);
				req.send();
				if (req.status == 200) {
					meta.shapesOrFuncs = eval(req.responseText);
				}
				vectorSprites[name] = new Ptero.VectorSprite(meta);
			}
			else {
				vectorSprites[name] = new Ptero.Sprite(images[name], meta);
			}
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
				var src = imageSources[name];
				if (navigator.isCocoonJS && src.match(/\.svg$/)) {
					// skip loading svg files in cocoon
					handleLoad();
				}
				else {
					img = new Image();
					img.src = src;
					img.onload = handleLoad;
					images[name] = img;
				}
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
		if (!navigator.isCocoonJS) {
			var s = 10;
			ctx.drawImage(Ptero.assets.images["boom1"],0,0,s,s);
			ctx.drawImage(Ptero.assets.images["boom2"],0,0,s,s);
			ctx.drawImage(Ptero.assets.images["boom3"],0,0,s,s);
		}
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
