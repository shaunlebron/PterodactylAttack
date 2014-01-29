
Ptero.Remote.assets = (function(){

	// because the loading of external JSON files seems to break CocoonJS,
	// I am pre-loading an auto-generated "src/jsonData.js" which contains
	// an object mapping a filename to its JSON object, essentially
	// a concantenated file of external json files.
	var usePreloadedJson = false;

	var imageSources = {
		"net": "img/net_01.png",
	};

	var jsonSources = {
		// button layouts
		"btns_remote": "layout/remote.json",
	};

	// Add secondary sources dependent on the primary sources listed above.
	(function(){
		var name;

		// add metadata json sources to loading list
		for (name in imageSources) {
			jsonSources[name] = imageSources[name]+".json";
		}
	})();

	var json = {};

	// "Image" objects, actual image file data
	var images = {};

	// post-processed image structures
	var sprites = {};

	function postProcessImage(name) {

		var meta = json[name];

		if (!sprites[name]) {
			console.log("creating sprite",name);
			sprites[name] = new Ptero.Sprite(images[name], meta);
		}
	};

	function postProcess() {

		var name;

		// post-process images
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

			// Make sure assets points to ours (kludge)
			Ptero.assets.json = json;
			Ptero.assets.images = images;
			Ptero.assets.sprites = sprites;

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

	return {
		json: json,
		load: load,
		images: images,
		sprites: sprites,
	};
})();
