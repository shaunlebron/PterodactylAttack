
Ptero.assets = (function(){

	// because the loading of external JSON files seems to break CocoonJS,
	// I am pre-loading an auto-generated "src/jsonData.js" which contains
	// an object mapping a filename to its JSON object, essentially
	// a concantenated file of external json files.
	var usePreloadedJson = true;

	var imageSources = {
		"bg" : "bg.jpg",
	};

	var vectorSources = {
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
			"cached": false,
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

	addPteroVectorAnim('baby_mountain_blue');
	addPteroVectorAnim('baby_mountain_purple');
	addPteroVectorAnim('adult_mountain_red');
	addPteroVectorAnim('adult_mountain_green');

	var jsonSources = {
		// stage paths
		"ptero_paths": "ptero_paths.json",
	};

	// Add secondary sources dependent on the primary sources listed above.
	(function(){
		var name;

		// add vector metadata to loading list
		for (name in vectorSources) {
			jsonSources[name] = vectorSources[name]+".json";
		}

		// add metadata json sources to loading list
		for (name in imageSources) {
			jsonSources[name] = imageSources[name]+".json";
		}

	})();

	var json = {};

	// "Image" objects, actual image file data
	var images = {};

	// post-processed image structures
	var vectorSprites = {};
	var sprites = {};

	function postProcessImage(name) {

		if (!sprites[name]) {
			console.log("creating sprite",name);
			sprites[name] = new Ptero.Sprite(images[name], {"scale": 1});
		}
	};

	function postProcessVector(name) {

		// load image metadata
		var meta = json[name];
		console.log(name);

		// append metadata with the vector path data

		if (!Ptero.vectorPathData[name]) {
			console.error('vector path data not found for',name);
		}
		meta.vectorPathData = Ptero.vectorPathData[name];

		// Create the vector sprite structure
		vectorSprites[name] = new Ptero.VectorSprite(meta);
	}

	function postProcess() {

		var name;

		// post-process vectors
		for (name in vectorSources) {
			postProcessVector(name);
		}

		for (name in imageSources) {
			postProcessImage(name);
		}
	}

	function load(onLoad) {

		// Determine the number of files we are loading.
		var totalCount = 0;
		for (name in imageSources) { totalCount++; }
		for (name in jsonSources) { totalCount++; }

		// Running count of how many files have been loaded.
		var count = 0;

		// Called when all files are loaded.
		function handleAllDone() {
			postProcess();
			onLoad && onLoad();
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
			if (images[name]) {
				handleLoad();
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
			if (json[name]) {
				handleLoad();
				continue;
			}
			src = jsonSources[name];
			if (usePreloadedJson) {
				json[name] = Ptero.jsonData[src];
				console.log("pre-loaded json: "+ name);
				handleLoad();
			}
			else {
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
	}

	function makeAnimSprite(name) {

		var vectorAnim = vectorAnims[name];

		var spriteData = {};
		if (vectorAnim) {
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
		makeAnimSprite: makeAnimSprite,
	};
})();
