// "Selected" wave means either:
// - its tab is active
// - its position (first node) can be dragged

Ptero.Fourier.WaveList = function() {
	this.waves = [];

	this.index = 0;

	this.time = 0;
	this.maxTime = 0;

	this.isEditing = false;
	this.isPaused = false;
};

Ptero.Fourier.WaveList.prototype = {

	// take all tabs out of edit mode
	deselectAll: function() {
		var i,len=this.waves.length;
		for (i=0; i<len; i++) {
			this.waves[i].isSelected = false;
		}
	},

	// put all tabs into edit mode
	selectSomething: function() {
		var i,len=this.waves.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.waves[i];
			if (!e.isSelected) {
				e.isSelected = true;
			}
		}
	},

	refreshOrder: function() {
		var i,len=this.waves.length;
		for (i=0; i<len; i++) {
			this.waves[i].order = i;
		}
	},
	refreshMaxTime: function() {
		var i,len=this.waves.length;
		this.maxTime = 0;
		for (i=0; i<len; i++) {
			var w = this.waves[i];
			this.maxTime = Math.max(this.maxTime, w.maxTime);
		}
	},
	setWaves: function(waves) {

		this.index = 0;
		var i,len=waves.length;
		for (i=0; i<len; i++) {
			this.index = Math.max(this.index, waves[i].index);
		}

		this.waves = waves;
		this.select(waves[0]);
		this.refreshMaxTime();
		this.refreshOrder();
		this.setTime(0);

		this.isEditing = false;
		this.deselectAll();
	},
	addWaveFromState: function(state) {
		this.index++;
		var e = Ptero.Fourier.Wave.fromState(state);
		e.index = this.index;
		this.waves.push(e);
		this.select(e);
		this.refreshMaxTime();
		this.refreshOrder();
		//Ptero.Fourier.loader.backup();
	},
	duplicateWave: function() {
		// duplicate the current active wave
		var state = Ptero.Fourier.wave.getState();
		this.addWaveFromState(state);
	},
	promptRemoveIndex: function(index) {
		var that = this;
		// TODO: attach a name to wave
		bootbox.confirm('Are you sure you want to delete "Wave '+index+'"?',
			function(result) {
				if (result) {
					that.removeIndex(index);
				}
			}
		);
	},
	previewIndex: function(index) {
		this.active_wave = Ptero.Fourier.wave;
		Ptero.Fourier.wave = this.getWaveFromIndex(index);
	},
	unpreviewIndex: function(index) {
		if (this.active_wave) {
			this.select(this.active_wave);
		}
		this.active_wave = undefined;
	},
	getWaveFromIndex: function(index) {
		var i,len=this.waves.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.waves[i];
			if (e.index == index) {
				return e;
			}
		}
		return null;
	},
	selectIndex: function(index) {
		this.select(this.getWaveFromIndex(index));
	},
	select: function(wave) {
		this.active_wave = wave;
		Ptero.Fourier.wave = wave;
		this.refreshTabs();
	},
	removeIndex: function(index) {
		this.remove(this.getWaveFromIndex(index));
	},
	remove: function(wave) {
		var i,len=this.waves.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.waves[i];
			if (e == wave) {
				this.waves.splice(i,1);
				if (len > 1) {
					this.select(this.waves[0]);
				}
				break;
			}
		}
		this.refreshMaxTime();
		this.refreshOrder();
		Ptero.Fourier.loader.backup();
	},
	getTabsString: function() {
		var i,e,len=this.waves.length;
		var str = "";
		for (i=0; i<len; i++) {
			e = this.waves[i];
			if (e == Ptero.Fourier.wave) {
				str += '<li class="active"><a href="#">';
			}
			else {
				str += '<li><a href="#" ';
				str += 'onclick="Ptero.Fourier.wave_list.selectIndex(' + e.index + ')"';
				str += 'onmouseover="Ptero.Fourier.wave_list.previewIndex(' + e.index + ')"';
				str += 'onmouseout="Ptero.Fourier.wave_list.unpreviewIndex(' + e.index + ')"';
				str += '>';
			}

			str += '<button class="close" type="button" ';
			str += 'onclick="Ptero.Fourier.wave_list.promptRemoveIndex(' +e.index+ ')"';
			str += '>&times;</button>Wave ' + e.index + '</a></li>';
		}
		str += '<li><a href="#" onclick="$(\'#import-wave-file\').click()"><i class="icon-white icon-plus"></i> Import</li>';
		return str;
	},
	refreshTabs: function() {
		$("#wavetabs").html(this.getTabsString());
	},
	resetWaves: function() {
		var i,len=this.waves.length;
		var e;
		for (i=0; i<len; i++) {
			var e = this.waves[i];
			e.reset();
		}
	},
	update: function(dt) {

		if (!Ptero.Fourier.wave) {
			return;
		}

		if (!this.isEditing && !this.isPaused) {
			var t = this.time + dt;
			if (t >= this.maxTime) {
				this.resetWaves();
				t %= this.maxTime;
			}
			this.setTime(t);
		}

		var i,len=this.waves.length;
		var e;
		for (i=0; i<len; i++) {
			var e = this.waves[i];
			e.update(dt);
		}
	},
	setTime: function(t) {
		this.time = t;
		var i,len=this.waves.length;
		for (i=0; i<len; i++) {
			this.waves[i].setTime(t);
		}
	},
};

// Wave is a list of enemies.
Ptero.Fourier.Wave = function() {
	this.startTime = 0;
	this.maxTime = 0;

	this.isSelected = false;
	this.enemies = [];
	this.enemy_models = null;
};

Ptero.Fourier.Wave.fromState = function(state) {
	var wave = new Ptero.Fourier.Wave();
	wave.enemy_models = state.models;
	wave.setStartTime(0);
	return wave;
};

Ptero.Fourier.Wave.prototype = {

	setStartTime: function(t) {
		this.startTime = t;
		this.refreshPaths();
	},
	refreshPaths: function() {
		this.enemies.length = 0;
		var models = this.enemy_models;
		this.maxTime = 0;
		var i,len=models.length;
		for (i=0; i<len; i++) {
			var e = Ptero.Enemy.fromState(models[i],this.startTime);
			e.isRemote = true;
			this.enemies.push(e);
			this.maxTime = Math.max(this.maxTime, e.path.totalTime);
		}
		Ptero.Fourier.wave_list.refreshMaxTime();
	},
	select: function() {
		this.isSelected = true;
		Ptero.Fourier.wave_list.isEditing = true;
		Ptero.Fourier.wave_list.selectSomething();
	},
	deselect: function() {
		this.isSelected = false;
		Ptero.Fourier.wave_list.isEditing = false;
		Ptero.Fourier.wave_list.deselectAll();
	},
	setTime: function(t) {
		var i,len=this.enemies.length;
		for (i=0; i<len; i++) {
			this.enemies[i].path.setTime(t);
		}
	},
	reset: function() {
		var i,len=this.enemies.length;
		for (i=0; i<len; i++) {
			this.enemies[i].init();
		}
	},
	update: function(dt) {
		var i,len=this.enemies.length;
		for (i=0; i<len; i++) {
			this.enemies[i].update(dt);
			var pos = this.enemies[i].getPosition();
			if (pos) {
				Ptero.deferredSprites.defer(
					(function(e,isSelected) {
						return function(ctx){
							e.draw(ctx);
							if (isSelected) {
								e.drawBorder(ctx,"#F00");
							}
						};
					})(this.enemies[i], this.isSelected && this == Ptero.Fourier.wave),
					pos.z);
			}
		}
	},
};
