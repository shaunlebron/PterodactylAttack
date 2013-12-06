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
			this.startTime = this.idlePath.time;
		}
		else {
			this.startTime = 0;
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
			this.startTime = this.path.time;
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
		var k = 0;

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
	setTime: function(t) {
		this.path.setTime(this.startTime+t);
		this.syncPositionToPath();
		this.deferSprites();
	},
	update: function(dt) {

		if (this.animating) {

			// update current path
			this.path.step(dt);

			this.syncPositionToPath();
		}

		this.deferSprites();
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
	setTime: function(t) {
		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].setTime(t);
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
			return bg;
		})(),

	};

	// Let each background know its own name.
	var name;
	for (name in Ptero.backgrounds) {
		Ptero.backgrounds[name].name = name;
	}
};

Ptero.setBackground = function(bgName) {
	var bg = Ptero.backgrounds[bgName];
	bg && bg.init();
	Ptero.background = bg;
	return bg;
};
