
Ptero.assets = (function(){

	var imageSources = {
		"bg_menu" : "bg/menu/bg_menu.jpg",

		"button_plank" : "img/plank.png",

		"buttonfont"   : "fonts/buttonfont.png",
		"whitefont"    : "fonts/whitefont.png",
		"scorefont"    : "fonts/scorefont.png",
		"redscorefont" : "fonts/redscorefont.png",

		"msg_complete"   : "img/msg/msg_complete.png",
		"msg_tut1"       : "img/msg/msg_tut1.png",
		"msg_tut2"       : "img/msg/msg_tut2.png",
		"msg_tut3"       : "img/msg/msg_tut3.png",
		"msg_tut4"       : "img/msg/msg_tut4.png",
		"msg_tut5"       : "img/msg/msg_tut5.png",
		"msg_helpbounty" : "img/msg/msg_helpbounty.png",
		"msg_helpnet"    : "img/msg/msg_helpnet.png",
		"msg_tryagain"   : "img/msg/msg_tryagain.png",
		"msg_ready"      : "img/msg/msg_ready.png",

		"credits": "img/credits.png",

		"menu_wrench"       : "img/menu/menu_wrench.png",
		"menu_strong"       : "img/menu/menu_strong.png",
		"menu_scroll"       : "img/menu/menu_scroll.png",

		"boom1": "img/boom1.png",
		"boom2": "img/boom2.png",
		"boom3": "img/boom3.png",

		"bullet": "img/bullet.png",
		"netbullet": "img/netbullet.png",

		"play"      : "img/play.png",
		"pause"     : "img/pause.png",
		"logo"      : "img/logo.png",
		"swipe"     : "img/swipe.png",

		"btn_back"         : "img/buttons/btn_back.png",

		"title" : "img/title.png",

		"backplate_mountain" : "img/backplate_menu_mountain.png",
		"backplate_ice"      : "img/backplate_menu_ice.png",

		"net": "img/net_01.png",
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

		"bg_volcano_00": "bg/volcano/00.svg",
		"bg_volcano_01": "bg/volcano/01.svg",
		"bg_volcano_02": "bg/volcano/02.svg",
		"bg_volcano_03": "bg/volcano/03.svg",
		"bg_volcano_04": "bg/volcano/04.svg",
		"bg_volcano_05": "bg/volcano/05.svg",
		"bg_volcano_06": "bg/volcano/06.svg",
		"bg_volcano_07": "bg/volcano/07.svg",
		"bg_volcano_08": "bg/volcano/08.svg",
		"bg_volcano_09": "bg/volcano/09.svg",
		"bg_volcano_10": "bg/volcano/10.svg",

	};

	// populated by "addPteroVectorAnim"
	var vectorAnims = {};

	// should be enemy.js, but we are just defaulting the values for now in "addPteroVectorAnim"
	Ptero.enemyTypes = {};

	// this is assuming a very specific frame structure for vectors
	function addPteroVectorAnim(name) {
		var numFrames = 9;
		var i;
		var frames = [];
		var frame_name;
		for (i=0; i<numFrames; i++) {
			frame_name = name+"_"+i;
			frames.push(frame_name);
			vectorSources[frame_name] = "swf/pteros/"+name+"/"+i+".svg";
		}
		vectorAnims[name] = {
			"fps": 12,
			"frames": frames,
		};

		// Create enemy type
		var health = 1;
		if (name == "baby") {
			// we're using these for the menu options only
			// that way selecting a menu option only takes one hit
			health = 1;
		}
		else if (name.match(/^baby_/)) {
			health = 2;
		}
		else if (name.match(/^adult/)) {
			health = 3;
		}
		Ptero.enemyTypes[name] = {
			"health": health,
			"damage": 1,
			"spriteName": name,
		};
	}

	addPteroVectorAnim('baby');
	addPteroVectorAnim('adult');
	addPteroVectorAnim('baby_white');
	addPteroVectorAnim('baby_mountain_blue');
	addPteroVectorAnim('baby_mountain_purple');
	addPteroVectorAnim('baby_ice_purple');
	addPteroVectorAnim('baby_ice_yellow');
	addPteroVectorAnim('baby_volcano_green');
	addPteroVectorAnim('baby_volcano_purple');
	addPteroVectorAnim('adult_white');
	addPteroVectorAnim('adult_mountain_red');
	addPteroVectorAnim('adult_mountain_green');
	addPteroVectorAnim('adult_ice_red');
	addPteroVectorAnim('adult_ice_green');
	addPteroVectorAnim('adult_volcano_blue');
	addPteroVectorAnim('adult_volcano_orange');

	var jsonSources = {

		// backgrounds
		"bg_mountain_layers" : "bg/mountain/layers.json",
		"bg_ice_layers"      : "bg/ice/layers.json",
		"bg_volcano_layers"  : "bg/volcano/layers.json",
		"bg_menu_layers"     : "bg/menu/layers.json",

		// misc paths
		"mainmenu_paths"   : "paths/mainmenu.json",
		"difficulty_paths" : "paths/difficulty.json",
		"highscores_paths" : "paths/highscores.json",

		// stage paths
		"mountain_path00": "paths/mountain/path00.json",
		"mountain_path01": "paths/mountain/path01.json",
		"mountain_path02": "paths/mountain/path02.json",
		"mountain_path03": "paths/mountain/path03.json",
		"mountain_path04": "paths/mountain/path04.json",
		"mountain_path05": "paths/mountain/path05.json",
		"mountain_path06": "paths/mountain/path06.json",
		"mountain_path07": "paths/mountain/path07.json",
		"mountain_path08": "paths/mountain/path08.json",
		"mountain_path09": "paths/mountain/path09.json",

		"ice_path00": "paths/ice/path00.json",
		"ice_path01": "paths/ice/path01.json",
		"ice_path02": "paths/ice/path02.json",
		"ice_path03": "paths/ice/path03.json",
		"ice_path04": "paths/ice/path04.json",
		"ice_path05": "paths/ice/path05.json",
		"ice_path06": "paths/ice/path06.json",
		"ice_path07": "paths/ice/path07.json",
		"ice_path08": "paths/ice/path08.json",
		"ice_path09": "paths/ice/path09.json",

		"volcano_path00": "paths/volcano/path00.json",
		"volcano_path01": "paths/volcano/path01.json",
		"volcano_path02": "paths/volcano/path02.json",
		"volcano_path03": "paths/volcano/path03.json",
		"volcano_path04": "paths/volcano/path04.json",
		"volcano_path05": "paths/volcano/path05.json",
		"volcano_path06": "paths/volcano/path06.json",
		"volcano_path07": "paths/volcano/path07.json",
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

	var json = {};

	// "Image" objects, actual image file data
	var images = {};

	// post-processed image structures
	var vectorSprites = {};
	var sprites = {};
	var tables = {};
	var mosaics = {};
	var fonts = {};

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
		else if (meta.font != undefined) {
			console.log("creating font",name);
			fonts[name] = new Ptero.SpriteFont(images[name], meta);
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

		if (!Ptero.vectorPathData[name]) {
			console.error('vector path data not found for',name);
		}
		meta.vectorPathData = Ptero.vectorPathData[name];

		// Create the vector sprite structure
		var vectorSprite = vectorSprites[name] = new Ptero.VectorSprite(meta);

		// duck-type detection of Firefox browser: http://stackoverflow.com/a/9851769/142317
		var isFirefox = typeof InstallTrigger !== 'undefined';
		if (navigator.isCocoonJS || isFirefox) {
			// do not use SVG files directly for Cocoon or Firefox
			// (firefox has poor support for large SVGs)
		}
		else {
			// use SVG files directly
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

	function load(d) {

		var loadingImageName = d.loadingImageName;
		var onStart = d.onStart;
		var onDone = d.onDone;

		// Load the loading image first.
		var name = loadingImageName;
		var src = imageSources[name];
		var img = new Image();
		img.src = src;
		img.onerror = function() {
			console.error("couldn't load image: "+ name);
		};
		img.onload = function() {
			console.log("loaded image: "+ name);
			var jsonSrc = jsonSources[name];
			var req = new XMLHttpRequest();
			req.onload = function() {
				json[name] = JSON.parse(this.responseText);
				console.log("loaded json: "+ name);

				// process the loading image
				postProcessImage(name);

				// signal to the caller that the loading image is ready to use
				onStart && onStart();

				// load the rest of the resources
				loadRest();
			};
			req.open('GET', jsonSrc, true);
			req.send();
		};
		images[name] = img;

		function loadRest() {

			// Determine the number of files we are loading.
			var totalCount = 0;
			for (name in imageSources) { totalCount++; }
			for (name in jsonSources) { totalCount++; }

			// Running count of how many files have been loaded.
			var count = 2; // already loaded "loading" image and json

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
			}

			// Load images
			var img,name,src,req;
			for (name in imageSources) {
				if (name == loadingImageName) {
					continue;
				}
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

			// Load json data.
			for (name in jsonSources) {
				if (name == loadingImageName) {
					continue;
				}
				src = jsonSources[name];
				req = new XMLHttpRequest();
				req.onload = (function(name){
					return function() {
						try {
							json[name] = JSON.parse(this.responseText);
							console.log("loaded json: "+ name);
							handleLoad();
						}
						catch (e) {
							console.log("ERROR: could not load json file",name);
							console.error("could not load json file",name);
						}
					};
				})(name);
				req.open('GET', src, true);
				req.send();
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
		fonts: fonts,
		makeAnimSprite: makeAnimSprite,
		keepExplosionsCached: keepExplosionsCached,
	};
})();
