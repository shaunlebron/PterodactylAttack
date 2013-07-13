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

	this.images = [];
};

Ptero.BackgroundLayer.prototype = {
	init: function() {
		this.introPath.reset();
		if (this.idlePath) {
			this.idlePath.reset();
		}

		this.path = this.introPath;
		this.syncPositionToPath();
	},
	setShade: function(color) {
		this.color = color;
	},
	deferImages: function() {

		var images = this.images;
		if (!navigator.isCocoonJS) {
			if (this.color == 'red') {
				images = this.redImages;
			}
			else if (this.color == 'white') {
				images = this.whiteImages;
			}
		}
		var i,len=images.length;

		// TODO: displace based on parallax offset
		var pos = this.position;

		Ptero.deferredSprites.defer(
			function(ctx) {
				for (i=0; i<len; i++) {
					images[i].draw(ctx, pos);
				}
			},
			this.depth);
	},
	syncPositionToPath: function() {
		// matching position to current position on path (paths always on near plane)
		this.position.x = this.path.val;
		this.position.y = 0;
		this.position.z = Ptero.screen.getFrustum().near;
	},
	update: function(dt) {

		// update current path
		this.path.step(dt);

		// update current path
		if (this.path == this.introPath && this.introPath.isDone()) {
			this.path = this.idlePath;
			this.idlePath.reset();
		}

		this.syncPositionToPath();

		this.deferImages();
	},
};

Ptero.Background = function() {
	this.layers = [];
	this.images = [];
};

Ptero.Background.prototype = {
	getLayerCollisions: function() {
		// placeholder until we implement collisions
		// (see usage in orb.js)
		return [];
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
	},
	update: function(dt) {
		var i,len=this.layers.length;
		for (i=0; i<len; i++) {
			this.layers[i].update(dt);
		}
	},
	loadLayersData: function(layersData) {
		var frustum = Ptero.screen.getFrustum();

		var i,numLayers=layersData.length;
		for (i=0; i<numLayers; i++) {

			// create new layer object
			var layer = new Ptero.BackgroundLayer();

			// get the data used to create this layer
			var d = layersData[i];

			// transfer verbatim attributes
			layer.desc = d.desc;
			layer.parallaxOffset = d.parallaxOffset;
			layer.collisionShapes = d.collisionShapes;

			// Set depth (use furthest depth until baklava works with new background format)
			//layer.depth = d.depth;
			layer.depth = frustum.far-i;

			// build image array from indexes
			var j,numImages = d.images.length;
			for (j=0; j<numImages; j++) {
				layer.images.push(this.images[d.images[j]]);
			}
			if (!navigator.isCocoonJS) {
				layer.redImages = [];
				layer.whiteImages = [];
				for (j=0; j<numImages; j++) {
					layer.redImages.push(this.redImages[d.images[j]]);
					layer.whiteImages.push(this.whiteImages[d.images[j]]);
				}
			}

			// build intro path from points
			layer.introPath = new Ptero.InterpDriver(
				Ptero.makeInterp('linear',
					d.introPath.values,
					d.introPath.deltaTimes),
				false);

			// build idle path from points
			if (d.idlePath.values.length == 0) {
				layer.idlePath = null;
				layer.introPath.freezeAtEnd = true;
			}
			else {
				layer.idlePath = new Ptero.InterpDriver(
					Ptero.makeInterp('linear',
						d.idlePath.values,
						d.idlePath.deltaTimes),
					true);
			}

			layer.init();

			// add this newly created layer to our layer list
			this.layers.push(layer);
		}
	},
};

Ptero.createBackgrounds = function() {

	// helper for creating image array for a background
	function setImages(bg, imageNames) {
		var i,len=imageNames.length;
		var name;

		// create image array
		bg.images = [];
		for (i=0; i<len; i++) {
			name = imageNames[i];
			bg.images.push(Ptero.assets.vectorSprites[name]);
		}

		// create image array for white and red versions
		if (!navigator.isCocoonJS) {
			bg.redImages = [];
			bg.whiteImages = [];
			for (i=0; i<len; i++) {
				name = imageNames[i];
				bg.redImages.push(Ptero.assets.vectorSprites[name+"_red"]);
				bg.whiteImages.push(Ptero.assets.vectorSprites[name+"_white"]);
			}
		}
	}

	Ptero.bg_mountain = (function(){

		var bg = new Ptero.Background();
		setImages(bg, [
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
			"bg_mountain_16",
			"bg_mountain_17",
		]);
		bg.loadLayersData(Ptero.assets.json["bg_mountain_layers"]);
		return bg;
	})();
};

Ptero.setBackground = function(bg) {
	bg.init();
	Ptero.background = bg;
};
