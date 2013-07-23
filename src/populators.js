/*
monitor:
- total hitpoints
- total dactyls
*/

Ptero.TimePopulator = function(d) {
	var attrs = [
		'clustersPerSecond',
		'hpHigh',
		'hpLow',
		'pteroHigh',
		'pteroLow',
		'isComposite',
		'timeDuration',
	];
	var i,name,len=attrs.length;
	for (i=0; i<len; i++) {
		name = attrs[i];
		this[name] = d[name];
	}

	this.init();
}

Ptero.TimePopulator.prototype = {
	init: function() {
		this.time = 0;
	},
	update: function(dt) {
		this.time += dt;

		if (this.time > this.timeDuration) {
			return;
		}

		if (this.time > this.clustersPerSecond) {
			this.time = 0;
			this.populate();
		}

	},

	getShuffledLibraries: function() {
		var i,len=this.libraries.length;
		var result = [];
		for (i=0; i<len; i++) {
			result.push(this.libraries[i]);
		}
		// TODO: shuffle
		return result;
	};

	populate: function() {
		var hpMax, hpMin;
		var pteroMax, pteroMin;
		var stageLimit; // TODO: get stage limit on ptero population
		var population; // TODO: get total population of pteros on screen

		if (stageLimit < population) {
			hpMax = this.hpLow;
			hpMin = null;
			pteroMax = this.pteroLow;
			pteroMin = null;
		}
		else {
			hpMax = this.hpHigh;
			hpMin = this.hpLow;
			pteroMax = this.pteroHigh;
			pteroMin = this.pteroLow;
		}

		var libraries = this.getShuffledLibraries();
		var i,len=libraries.length;
		var lib,waves,w;
		for (i=0; i<len; i++) {
			lib = libraries[i];
			waves = lib.select(function(w) {
				return (
					(pteroMax == null || w.) &&
				);
			});
			if (waves) {
				// TODO: place random wave in scene
				break;
			}
		}
	},
};

Ptero.DcPopulator = function(d) {
	var attrs = [
		'hpMax',
		'hpMin',
		'pteroMax',
		'pteroMin',
		'isComposite',
	];
	var i,name,len=attrs.length;
	for (i=0; i<len; i++) {
		name = attrs[i];
		this[name] = d[name];
	}
}

Ptero.DcPopulator.prototype = {
	update: function(dt) {
	},
};

