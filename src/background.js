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
		this.introPath.reset();
		if (this.idlePath) {
			this.idlePath.reset();
		}

		this.path = this.introPath;
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

		// TODO: displace based on parallax offset
		var pos = this.position;

		Ptero.deferredSprites.defer(
			function(ctx) {
				for (i=0; i<len; i++) {
					sprites[i].draw(ctx, pos, color);
				}
			},
			this.depth);
	},
	syncPositionToPath: function() {
		this.setX(this.path.val);
	},
	setX: function(x) {
		this.position.x = x;
		this.position.y = 0;
		this.position.z = Ptero.screen.getFrustum().near;
	},
	update: function(dt) {

		if (this.animating) {

			// update current path
			this.path.step(dt);

			// update current path
			if (this.path == this.introPath && this.introPath.isDone()) {
				this.path = this.idlePath;
				this.idlePath.reset();
			}

			
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
		}
	},
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

		var bezier = function(x1, y1, x2, y2, epsilon){
			/*
			Source: https://github.com/arian/cubic-bezier

			MIT License

			Copyright (c) 2013 Arian Stolwijk

			Permission is hereby granted, free of charge, to any person obtaining a copy of
			this software and associated documentation files (the "Software"), to deal in
			the Software without restriction, including without limitation the rights to
			use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
			of the Software, and to permit persons to whom the Software is furnished to do
			so, subject to the following conditions:

			The above copyright notice and this permission notice shall be included in all
			copies or substantial portions of the Software.

			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
			SOFTWARE.
			*/

			var curveX = function(t){
				var v = 1 - t;
				return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
			};

			var curveY = function(t){
				var v = 1 - t;
				return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
			};

			var derivativeCurveX = function(t){
				var v = 1 - t;
				return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
			};

			return function(t){

				var x = t, t0, t1, t2, x2, d2, i;

				// First try a few iterations of Newton's method -- normally very fast.
				for (t2 = x, i = 0; i < 8; i++){
					x2 = curveX(t2) - x;
					if (Math.abs(x2) < epsilon) return curveY(t2);
					d2 = derivativeCurveX(t2);
					if (Math.abs(d2) < 1e-6) break;
					t2 = t2 - x2 / d2;
				}

				t0 = 0, t1 = 1, t2 = x;

				if (t2 < t0) return curveY(t0);
				if (t2 > t1) return curveY(t1);

				// Fallback to the bisection method for reliability.
				while (t0 < t1){
					x2 = curveX(t2);
					if (Math.abs(x2 - x) < epsilon) return curveY(t2);
					if (x > x2) t0 = t2;
					else t1 = t2;
					t2 = (t1 - t0) * .5 + t0;
				}

				// Failure
				return curveY(t2);

			};

		};

		// ms is the expected duration of the interpolation
		function getBezierEpsilon(ms) {
			return (1000 / 60 / ms) / 4;
		}

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

			// build sprite array from indexes
			var j,numImages = d.images.length;
			for (j=0; j<numImages; j++) {
				layer.sprites.push(this.sprites[d.images[j]]);
			}

			// build intro path from points
			layer.introPath = new Ptero.InterpDriver(
				Ptero.makeInterp(bezier(0.25, 0, 0.25, 1, getBezierEpsilon(2000)),
				//Ptero.makeInterp('linear',
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
				"bg_mountain_16",
				"bg_mountain_17",
			]);
			bg.loadLayersData(Ptero.assets.json["bg_mountain_layers"]);
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
			return bg;
		})(),

		"rock": (function(){
			var bg = new Ptero.Background();
			setSprites(bg, [
				"bg_rock",
			]);
			bg.loadLayersData(Ptero.assets.json["bg_rock_layers"]);
			return bg;
		})(),
	};
};

Ptero.setBackground = function(bgName) {
	var bg = Ptero.backgrounds[bgName];
	bg.init();
	Ptero.background = bg;
	return bg;
};
