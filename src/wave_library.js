Ptero.Wave = function(num,hp,data) {
	this.num = num;
	this.hp = hp;
	this.data = data;
};

// Build a Wave from key names
Ptero.Wave.fromKey = function(key) {
	var data = Ptero.assets.json[key];

	var match = key.match(/_(\d+)D_(\d+)HP/);
	if (match) {
		var num = match[1];
		var hp = match[2];
		return new Ptero.Wave(num,hp,data);
	}

	return null;
};

Ptero.Wave.prototype = {
};

Ptero.WaveLibrary = function(waves) {
	this.waves = waves;
};

// Build a Wave Library from key names
Ptero.WaveLibrary.fromKeys = function(waveKeys) {
	var waves = [];
	var i,key,len=waveKeys.length;
	for (i=0; i<len; i++) {
		waves.push(Ptero.Wave.fromKey(waveKeys[i]));
	}
	return new Ptero.WaveLibrary(waves);
};

Ptero.WaveLibrary.prototype = {
	select: function(selector) {
		var result = [];
		var i,len=this.waves.length;
		var wave;
		for (i=0; i<len; i++) {
			wave = this.waves[i];
			if (select(wave)) {
				result.push(wave);
			}
		}
		return result;
	},
};

Ptero.createWaveLibraries = function() {

	Ptero.waveLibraries = {
		"A": Ptero.WaveLibrary.fromKeys([
			"A1_1D_1HP",
			"A2_2D_2HP",
			"A3_3D_3HP",
			"A4_4D_4HP",
			"A5_5D_5HP",
		]),
		"B": Ptero.WaveLibrary.fromKeys([
			"B1_1D_2HP",
			"B2_2D_4HP",
			"B3_3D_6HP",
			"B4_4D_8HP",
			"B5_5D_10HP",
			"B6_6D_12HP",
		]),
	};

};
