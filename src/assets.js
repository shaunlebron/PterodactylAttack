
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

		//"baby"        : "img/pteros/baby.png",
		"baby_green"  : "img/pteros/baby_green.png",
		"baby_pink"   : "img/pteros/baby_pink.png",
		"baby_purple" : "img/pteros/baby_purple.png",
		"baby_teal"   : "img/pteros/baby_teal.png",
		"baby_yellow" : "img/pteros/baby_yellow.png",

		//"adult"              : "img/pteros/adult.png",
		"adult_green"        : "img/pteros/adult_green.png",
		"adult_greenspot"    : "img/pteros/adult_greenspot.png",
		"adult_pink"         : "img/pteros/adult_pink.png",
		"adult_purple"       : "img/pteros/adult_purple.png",
		"adult_red"          : "img/pteros/adult_red.png",
		"adult_redspot"      : "img/pteros/adult_redspot.png",
		"adult_yellow"       : "img/pteros/adult_yellow.png",
		"adult_yellowstripe" : "img/pteros/adult_yellowstripe.png",

	};

	var vectorAnims = {
		"baby": {
			"fps": 20,
			"frames": [
				"baby_0",
				"baby_1",
				"baby_2",
				"baby_3",
				"baby_4",
				"baby_5",
				"baby_6",
				"baby_7",
				"baby_8",
			],
		},
		"adult": {
			"fps": 20,
			"frames": [
				"adult_0",
				"adult_1",
				"adult_2",
				"adult_3",
				"adult_4",
				"adult_5",
				"adult_6",
				"adult_7",
				"adult_8",
			],
		},
	};

	var vectorSources = {
		"bg_mountain_00": "bg/mountain/00.svg",
		"bg_mountain_01": "bg/mountain/01.svg",
		"bg_mountain_02": "bg/mountain/02.svg",
		"bg_mountain_03": "bg/mountain/03.svg",
		"bg_mountain_04": "bg/mountain/04.svg",
		"bg_mountain_05": "bg/mountain/05.svg",
		"bg_mountain_06": "bg/mountain/06.svg",
		"bg_mountain_07": "bg/mountain/07.svg",
		"bg_mountain_08": "bg/mountain/08.svg",
		"bg_mountain_09": "bg/mountain/09.svg",
		"bg_mountain_10": "bg/mountain/10.svg",
		"bg_mountain_11": "bg/mountain/11.svg",
		"bg_mountain_12": "bg/mountain/12.svg",
		"bg_mountain_13": "bg/mountain/13.svg",
		"bg_mountain_14": "bg/mountain/14.svg",
		"bg_mountain_15": "bg/mountain/15.svg",
		"bg_mountain_16": "bg/mountain/16.svg",
		"bg_mountain_17": "bg/mountain/17.svg",

		"bg_ice_00": "bg/ice/00.svg",
		"bg_ice_01": "bg/ice/01.svg",
		"bg_ice_02": "bg/ice/02.svg",
		"bg_ice_03": "bg/ice/03.svg",
		"bg_ice_04": "bg/ice/04.svg",
		"bg_ice_05": "bg/ice/05.svg",
		"bg_ice_06": "bg/ice/06.svg",
		"bg_ice_07": "bg/ice/07.svg",
		"bg_ice_08": "bg/ice/08.svg",
		"bg_ice_09": "bg/ice/09.svg",

		"baby_0": "swf/pteros/baby/0.svg",
		"baby_1": "swf/pteros/baby/1.svg",
		"baby_2": "swf/pteros/baby/2.svg",
		"baby_3": "swf/pteros/baby/3.svg",
		"baby_4": "swf/pteros/baby/4.svg",
		"baby_5": "swf/pteros/baby/5.svg",
		"baby_6": "swf/pteros/baby/6.svg",
		"baby_7": "swf/pteros/baby/7.svg",
		"baby_8": "swf/pteros/baby/8.svg",

		"adult_0": "swf/pteros/adult/0.svg",
		"adult_1": "swf/pteros/adult/1.svg",
		"adult_2": "swf/pteros/adult/2.svg",
		"adult_3": "swf/pteros/adult/3.svg",
		"adult_4": "swf/pteros/adult/4.svg",
		"adult_5": "swf/pteros/adult/5.svg",
		"adult_6": "swf/pteros/adult/6.svg",
		"adult_7": "swf/pteros/adult/7.svg",
		"adult_8": "swf/pteros/adult/8.svg",
	};

	var jsonSources = {

		// levels
		"level1": "levels/level1.json",
		"fourier": "levels/fourier-level",
		"survival01": "levels/survival01.json",
		"survival02": "levels/survival02.json",
		"survival03": "levels/survival03.json",

		// backgrounds
		"bg_mountain_layers": "bg/mountain/layers.json",
		"bg_ice_layers": "bg/ice/layers.json",

		// misc paths
		"mainmenu_paths": "paths/mainmenu.json",
		"difficulty_paths": "paths/difficulty.json",
		"highscores_paths": "paths/highscores.json",
	};

	// Add secondary sources dependent on the primary sources listed above.
	(function(){
		var name;

		// load SVG images for faster drawing of vector images if we're not in Cocoon
		if (!navigator.isCocoonJS) {
			var name;
			for (name in vectorSources) {

				// make the vector source load as an image
				imageSources[name] = vectorSources[name];

				// add the white- and red-shaded versions of the background layers
				if (name.match(/^bg_/)) {
					imageSources[name+"_red"] = vectorSources[name].replace(/svg$/, "red.svg");
					imageSources[name+"_white"] = vectorSources[name].replace(/svg$/, "white.svg");
				}
			}
		}

		// add metadata json sources to loading list
		for (name in imageSources) {
			jsonSources[name] = imageSources[name]+".json";
		}

		// add vector metadata to loading list
		for (name in vectorSources) {
			jsonSources[name] = vectorSources[name]+".json";
		}

	})();

	var vectorPathData = {};

	var json = {};

	// "Image" objects, actual image file data
	var images = {};

	// post-processed image structures
	var vectorSprites = {};
	var sprites = {};
	var tables = {};
	var mosaics = {};

	function postProcessImage(name) {

		var meta = json[name];

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

	function postProcessVector(name) {

		// load image metadata
		var meta = json[name];

		// append metadata with the vector path data
		meta.vectorPathData = vectorPathData[name];

		// Create the vector sprite structure
		var vectorSprite = vectorSprites[name] = new Ptero.VectorSprite(meta);

		// Add information on the SVG version for faster drawing outside of Cocoon
		if (!navigator.isCocoonJS) {
			vectorSprite.sprite = sprites[name];
			if (sprites[name+"_red"]) {
				vectorSprite.redSprite = sprites[name+"_red"];
			}
			if (sprites[name+"_white"]) {
				vectorSprite.whiteSprite = sprites[name+"_white"];
			}
		}
	}

	function postProcess() {

		var name;

		// post-process images
		for (name in imageSources) {
			postProcessImage(name);
		}

		// post-process vectors
		for (name in vectorSources) {
			postProcessVector(name);
		}
	};

	function load(onDone,onProgress) {

		// Call onprogress for first time.
		onProgress && onProgress(0);

		// Determine the number of files we are loading.
		var totalCount = 0;
		for (name in imageSources) { totalCount++; }
		for (name in vectorSources) { totalCount++; }
		for (name in jsonSources) { totalCount++; }

		// Running count of how many files have been loaded.
		var count = 0;

		// Called when all files are loaded.
		function handleAllDone() {
			postProcess();
			onDone && onDone();
		}

		// Called after a file is loaded.
		function handleLoad() {
			count++;
			//console.log(count, totalCount);
			if (count == totalCount) {
				handleAllDone();
			}
			onProgress && onProgress(count/totalCount);
		}

		var img,name,src,req;

		// Load images
		for (name in imageSources) {
			src = imageSources[name];
			console.log('image',name, src);
			img = new Image();
			img.src = src;
			img.onerror = (function(name){
				return function() {
					console.error("couldn't load image: "+ name);
				};
			})(name);
			img.onload = (function(name){
				return function() {
					console.log("loaded image: "+ name);
					handleLoad();
				};
			})(name);
			images[name] = img;
		}

		// Load vector path data
		for (name in vectorSources) {
			src = vectorSources[name] + ".js";
			req = new XMLHttpRequest();
			req.onload = (function(name){
				return function() {
					vectorPathData[name] = eval(this.responseText);
					console.log("loaded js: "+ name);
					handleLoad();
				};
			})(name);
			req.open('GET', src, true);
			req.send();
		}

		// Load json data.
		for (name in jsonSources) {
			src = jsonSources[name];
			req = new XMLHttpRequest();
			req.onload = (function(name){
				return function() {
					json[name] = JSON.parse(this.responseText);
					console.log("loaded json: "+ name);
					handleLoad();
				};
			})(name);
			req.open('GET', src, true);
			req.send();
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

		var table = tables[name];
		var mosaic = mosaics[name];
		var vectorAnim = vectorAnims[name];

		var spriteData = {};
		if (table) {
			spriteData.table = table;
		}
		else if (mosaic) {
			spriteData.mosaic = mosaic;
		}
		else if (vectorAnim) {
			spriteData.vectorAnim = vectorAnim;
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
		makeAnimSprite: makeAnimSprite,
		keepExplosionsCached: keepExplosionsCached,
	};
})();
