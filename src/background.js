/*

A background layer's position is always on the near plane for simplicity for tracking
depth-independent movement relative to the screen.

Though the collision geometry for each layer is stored in these near cooordinates,
they are projected to the layer's depth at init to allow for easier collision checks.

*/

Ptero.BackgroundLayer = function() {

	this.depth = null;
	this.position = {}; // will be replaced by path

	this.path = null; // active path
	this.introPath = null;
	this.idlePath = null;

	this.collisionShapes = [];
	this.parallaxOffset = null;

	this.sprites = [];
	this.animating = true;
};

Ptero.BackgroundLayer.prototype = {
	init: function() {
		if (this.introPath) {
			this.introPath.reset();
		}
		if (this.idlePath) {
			this.idlePath.reset();
			this.idlePath.stepRandom();
		}

		this.path = this.introPath;

		// For now, we are skipping the intro path for layers with an idle path.
		// This is a temporary fix for aesthetics so we don't have to blend the idle path with the exit path.
		if (this.idlePath) {
			this.path = this.idlePath;
		}

		this.syncPositionToPath();
	},
	exit: function() {
		// For now, we are skipping the intro path for layers with an idle path.
		// This is a temporary fix for aesthetics so we don't have to blend the idle path with the exit path.
		if (this.idlePath) {
			return;
		}

		this.path = this.outroPath;
		this.outroPath.reset();
	},
	goToIdle: function() {
		if (this.idlePath) {
			this.path = this.idlePath;
		}
		else {
			this.path = this.introPath;
			this.path.setTime(this.path.totalTime);
		}
		this.syncPositionToPath();
	},
	isPixelInside: function(x,y) {
		var i,len=this.sprites.length;
		for (i=0; i<len; i++) {
			if (this.sprites[i].isPixelInside(this.position,x,y)) {
				return true;
			}
		}
		return false;
	},
	setShade: function(color) {
		this.color = color;
	},
	deferSprites: function() {

		var color = this.color;
		var sprites = this.sprites;
		var i,len=sprites.length;

		// get displace position of layer due to parallax
		// FIXME: scale parallax offset appropriately if we ever have layer positions away from the near plane
		var k = Ptero.screen.getParallaxMultiplier();

		// do not allow parallax shifting when in background is in intro or outro
		// (because the black fullscreen can't be shifted)
		if (!Ptero.background.isIdle) {
			k = 0;
		}

		var offset = this.parallaxOffset;
		var pos = {
			x: this.position.x + k*offset,
			y: this.position.y,
			z: this.position.z,
		};

		var depth = this.depth;

		// set visual depth drawing order so we can see the layer over other while adjusting its anim position
		if (Ptero.Baklava && Ptero.Baklava.model.mode == 'anim' && this.isSelected) {
			depth = 0;
		}

		Ptero.deferredSprites.defer(
			function(ctx) {
				for (i=0; i<len; i++) {
					sprites[i].draw(ctx, pos, color);
				}
			},
			depth);
	},
	syncPositionToPath: function() {
		this.setX(this.path.val);
	},
	setX: function(x) {
		this.position.x = x;
		this.position.y = 0;
		this.position.z = Ptero.frustum.near;
	},
	update: function(dt) {

		if (this.animating) {

			// update current path
			this.path.step(dt);

			this.syncPositionToPath();
		}

		this.deferSprites();
	},
	getCollisionStates: function() {
		var result = [];
		var i,numShapes = this.collisionShapes.length;
		for (i=0; i<numShapes; i++) {
			var shape = this.collisionShapes[i];
			result.push(shape.getState());
		}
		return result;
	},
	setCollisionStates: function(result) {
		this.collisionShapes.length = 0;
		if (!result) {
			return;
		}

		var i,numShapes = result.length;
		for (i=0; i<numShapes; i++) {
			var shapeState = result[i];
			var shape = Ptero.CollisionShape.fromState(shapeState)
			shape.projectToZ(this.depth);
			this.collisionShapes.push(shape);
		}
	},
};

Ptero.Background = function() {
	this.layers = [];
	this.sprites = [];
};

Ptero.Background.prototype = {
	setAnimating: function(on) {
		var i,len = this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].animating = on;
		}
	},
	goToIdle: function() {
		var i,len = this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].goToIdle();
		}
	},
	getLayerFromPixel: function(x,y) {

		// copy layers array
		var orderedLayers = [];
		var i,len = this.layers.length;
		for (i=0; i<len; i++) {
			orderedLayers.push({
				origIndex: i,
				layer: this.layers[i],
			});
		}

		// sort the copied array of layers
		orderedLayers.sort(function(a,b) {
			return a.layer.depth - b.layer.depth;
		});

		// return the first layer index which contains the pixel
		var obj;
		for (i=0; i<len; i++) {
			obj = orderedLayers[i];
			if (obj.layer.isPixelInside(x,y)) {
				return obj.origIndex;
			}
		}

		return null;
	},
	setSelectedLayer: function(j) {
		this.selectedLayer = j;
		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			var color;
			if (j == null) {
				color = null;
			}
			else if (i == j) {
				color = 'red';
			}
			else {
				color = 'white';
			}
			this.layers[i].setShade(color);
			this.layers[i].isSelected = (i == j);
		}
	},

	// SELECTED LAYER HELPERS

	// COLLISIONS

	addLayerCollisionShape: function(shape) {
		var layer = this.layers[this.selectedLayer];
		if (layer && shape) {
			layer.collisionShapes.push(shape);
		}
	},
	getLayerCollisionShapes: function() {
		var layer = this.layers[this.selectedLayer];
		if (layer) {
			return layer.collisionShapes;
		}
	},
	removeLayerCollisionShape: function(shape) {
		var layer = this.layers[this.selectedLayer];
		if (layer && shape) {
			var index = layer.collisionShapes.indexOf(shape);
			if (index >= 0) {
				layer.collisionShapes.splice(index, 1);
			}
		}
	},

	// PARALLAX

	setLayerParallaxOffset: function(offset) {
		var layer = this.layers[this.selectedLayer];
		if (layer) {
			layer.parallaxOffset = offset;
		}
	},
	getLayerParallaxOffset: function() {
		var layer = this.layers[this.selectedLayer];
		if (layer) {
			return layer.parallaxOffset;
		}
	},

	setShade: function(color) {
		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].setShade(color);
		}
	},
	init: function() {
		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].init();
		}

		var i,len=this.layers.length;
		var layer;
		for (i=0; i<len; i++) {
			var layer = this.layers[i];
			if (!layer.idlePath) {
				break;
			}
		}
		this.animLayerRef = layer;

		this.isIdle = false;
		this.isExitDone = false;
	},
	exit: function() {
		this.isIdle = false;
		this.isExitDone = false;

		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].exit();
		}
	},
	update: function(dt) {

		// trigger onIntroDone event if needed
		if (!this.isIdle) {
			var layer = this.animLayerRef;
			this.isIdle = (layer.path == layer.introPath && layer.path.time >= layer.path.totalTime);
			if (this.isIdle) {
				this.onIdle && this.onIdle();
			}
		}

		// trigger onExitDone event if needed
		if (!this.isExitDone) {
			var layer = this.animLayerRef;
			this.isExitDone = (layer.path == layer.outroPath && layer.path.time >= layer.path.totalTime);
			if (this.isExitDone) {
				this.onExitDone && this.onExitDone();
			}
		}

		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].update(dt);
		}

		// Each background has an associated group of pterodactyls that must be pre-loaded, so this is done here.
		// Though this is executed every frame, it is effectively only executed once for every vector animation.
		// (see Ptero.assets.cacheVectorAnim)
		var i,len=this.vectorAnimsToLoad.length;
		var name;
		for (i=0; i<len; i++) {
			name = this.vectorAnimsToLoad[i];
			Ptero.deferredSprites.defer(
				(function(name){
					return function(ctx) {
						Ptero.assets.cacheVectorAnim(ctx,name);
					};
				})(name), 0);
		}
	},
	loadLayersData: function(layersData) {
		// layersData defaults to the current layersData
		layersData = layersData || this.layersData;

		this.layersData = layersData;
		this.layers.length = 0;

		// ms is the expected duration of the interpolation
		function getBezierEpsilon(ms) {
			return (1000 / 60 / ms) / 4;
		}

		var frustum = Ptero.frustum;

		var i,numLayers=layersData.length;
		for (i=0; i<numLayers; i++) {

			// create new layer object
			var layer = new Ptero.BackgroundLayer();

			// get the data used to create this layer
			var d = layersData[i];

			// transfer verbatim attributes
			layer.desc = d.desc;
			layer.depth = d.depth;
			layer.parallaxOffset = d.parallaxOffset;
			layer.setCollisionStates(d.collisionShapes);

			// build sprite array from indexes
			var j,numImages = d.images.length;
			for (j=0; j<numImages; j++) {
				layer.sprites.push(this.sprites[d.images[j]]);
			}

			console.log(d);
			if (!d.anim) {
				d.anim = {
					"values": [0,0],
					"type": "intro",
					"time": 0,
				};
			}

			var vals = d.anim.values;
			if (d.anim.type == 'intro') {
				layer.introPath = new Ptero.InterpDriver(
					Ptero.makeInterp(Ptero.bezier(0.25, 0, 0.25, 1, getBezierEpsilon(2000)),
						vals,
						[0,2]),
					false);
				layer.introPath.freezeAtEnd = true;
				layer.outroPath = new Ptero.InterpDriver(
					Ptero.makeInterp('linear',
						[vals[1], vals[0]],
						[0,2]),
					false);
				layer.outroPath.freezeAtEnd = true;
			}
			else if (d.anim.type == 'idle-restart') {
				layer.idlePath = new Ptero.InterpDriver(
					Ptero.makeInterp('linear',
						vals,
						[0,d.anim.time]),
					true);
			}
			else if (d.anim.type == 'idle-roundtrip') {
				layer.idlePath = new Ptero.InterpDriver(
					Ptero.makeInterp('linear',
						[vals[0], vals[1], vals[0]],
						[0,d.anim.time,d.anim.time]),
					true);
			}

			layer.init();

			// add this newly created layer to our layer list
			this.layers.push(layer);
		}
	},
};

Ptero.createBackgrounds = function() {

	// helper for creating sprite array for a background
	function setSprites(bg, spriteNames) {
		var i,len=spriteNames.length;
		var name;

		// create sprite array
		bg.sprites = [];
		for (i=0; i<len; i++) {
			name = spriteNames[i];
			bg.sprites.push(Ptero.assets.vectorSprites[name]);
		}
	}

	Ptero.backgrounds = {
		"mountain": (function(){
			var bg = new Ptero.Background();
			setSprites(bg, [
				"bg_mountain_00",
				"bg_mountain_01",
				"bg_mountain_02",
				"bg_mountain_03",
				"bg_mountain_04",
				"bg_mountain_05",
				"bg_mountain_06",
				"bg_mountain_07",
				"bg_mountain_08",
				"bg_mountain_09",
				"bg_mountain_10",
				"bg_mountain_11",
				"bg_mountain_12",
				"bg_mountain_13",
				"bg_mountain_14",
				"bg_mountain_15",
			]);
			bg.loadLayersData(Ptero.assets.json["bg_mountain_layers"]);
			bg.vectorAnimsToLoad = [
				'baby_mountain_blue',
				'baby_mountain_purple',
				'adult_mountain_red',
				'adult_mountain_green',
				'baby_white',
				'adult_white',
			];
			bg.pteroPaths = [
				Ptero.assets.json["mountain_path00"],
				Ptero.assets.json["mountain_path01"],
				Ptero.assets.json["mountain_path02"],
				Ptero.assets.json["mountain_path03"],
				Ptero.assets.json["mountain_path04"],
				Ptero.assets.json["mountain_path05"],
				Ptero.assets.json["mountain_path06"],
				Ptero.assets.json["mountain_path07"],
				Ptero.assets.json["mountain_path08"],
				Ptero.assets.json["mountain_path09"],
			];
			return bg;
		})(),

		"ice": (function(){
			var bg = new Ptero.Background();
			setSprites(bg, [
				"bg_ice_00",
				"bg_ice_01",
				"bg_ice_02",
				"bg_ice_03",
				"bg_ice_04",
				"bg_ice_05",
				"bg_ice_06",
				"bg_ice_07",
				"bg_ice_08",
				"bg_ice_09",
			]);
			bg.loadLayersData(Ptero.assets.json["bg_ice_layers"]);
			bg.vectorAnimsToLoad = [
				'baby_ice_purple',
				'baby_ice_yellow',
				'adult_ice_red',
				'adult_ice_green',
				'baby_white',
				'adult_white',
			];
			bg.pteroPaths = [
				Ptero.assets.json["ice_path00"],
				Ptero.assets.json["ice_path01"],
				Ptero.assets.json["ice_path02"],
				Ptero.assets.json["ice_path03"],
				Ptero.assets.json["ice_path04"],
				Ptero.assets.json["ice_path05"],
				Ptero.assets.json["ice_path06"],
				Ptero.assets.json["ice_path07"],
				Ptero.assets.json["ice_path08"],
				Ptero.assets.json["ice_path09"],
			];
			return bg;
		})(),

		"volcano": (function(){
			var bg = new Ptero.Background();
			setSprites(bg, [
				"bg_volcano_00",
				"bg_volcano_01",
				"bg_volcano_02",
				"bg_volcano_03",
				"bg_volcano_04",
				"bg_volcano_05",
				"bg_volcano_06",
				"bg_volcano_07",
				"bg_volcano_08",
				"bg_volcano_09",
				"bg_volcano_10",
			]);
			bg.vectorAnimsToLoad = [
				'baby_volcano_green',
				'baby_volcano_purple',
				'adult_volcano_blue',
				'adult_volcano_orange',
				'baby_white',
				'adult_white',
			];
			bg.pteroPaths = [
				Ptero.assets.json["volcano_path00"],
				Ptero.assets.json["volcano_path01"],
				Ptero.assets.json["volcano_path02"],
				Ptero.assets.json["volcano_path03"],
				Ptero.assets.json["volcano_path04"],
				Ptero.assets.json["volcano_path05"],
				Ptero.assets.json["volcano_path06"],
				Ptero.assets.json["volcano_path07"],
			];
			bg.loadLayersData(Ptero.assets.json["bg_volcano_layers"]);
			return bg;
		})(),

		"menu": (function(){
			var bg = new Ptero.Background();
			bg.sprites = [
				Ptero.assets.sprites["bg_menu"],
			];
			bg.loadLayersData(Ptero.assets.json["bg_menu_layers"]);
			bg.vectorAnimsToLoad = [
				'baby_ice_purple',
				'baby_ice_yellow',
				'adult_ice_red',
				'adult_ice_green',
			];
			return bg;
		})(),

		"tutorial": (function(){
			var bg = new Ptero.Background();
			setSprites(bg, [
				"bg_tutorial_00",
			]);
			bg.loadLayersData(Ptero.assets.json["bg_tutorial_layers"]);
			bg.vectorAnimsToLoad = [
				'baby_mountain_blue',
				'baby_mountain_purple',
				'adult_mountain_red',
				'adult_mountain_green',
				'baby_white',
				'adult_white',
			];
			bg.pteroPaths = [
				Ptero.assets.json["tutorial_path00"],
				Ptero.assets.json["tutorial_path01"],
				Ptero.assets.json["tutorial_path02"],
				Ptero.assets.json["tutorial_path03"],
				Ptero.assets.json["tutorial_path04"],
				Ptero.assets.json["tutorial_path05"],
			];
			return bg;
		})(),

	};

	// Let each background know its own name.
	var name;
	for (name in Ptero.backgrounds) {
		Ptero.backgrounds[name].name = name;
	}
};

Ptero.getNextBgName = function(currName) {
	var names = [
		"mountain",
		"ice",
		"volcano",
	];
	var currName = currName || Ptero.background.name;
	var i,len=names.length;
	for (i=0; i<len; i++) {
		if (names[i] == currName) {
			return names[(i+1)%len];
		}
	}
};

Ptero.setBackground = function(bgName) {
	var bg = Ptero.backgrounds[bgName];
	bg && bg.init();
	Ptero.background = bg;
	return bg;
};
