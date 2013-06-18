
Ptero.audio = (function() {
	var titleSong;
	var shoot,explode,hurt;
	var select;

	function init() {
		shoot = new Audio("audio/shoot04.wav");
		explode = new Audio("audio/explode04.wav");
		hurt = new Audio("audio/hurt.wav");
		select = new Audio("audio/select04.wav");
		titleSong = new Ptero.Song("audio/theme3.mp3");
	}

	function update(dt) {
		titleSong.update(dt);
	}

	return {
		init: init,
		update: update,
		playSelect: function() { select.play(); },
		playShoot: function() { shoot.play(); },
		playExplode: function() { explode.play(); },
		playHurt: function() { hurt.play(); },
		getTitleSong: function() { return titleSong; },
	};
})();

Ptero.Song = function(filepath) {
	this.filepath = filepath;
	this.audio = new Audio();
	this.audio.src = this.filepath;
};

Ptero.Song.prototype = {
	update: function(dt) {
		if (this.volumeFader) {
			this.volumeFader.update(dt);
		}
	},
	stop: function() {
		this.pause();
	},
	pause: function() {
		//this.audio.src = this.filepath;
		this.audio.pause();
	},
	getVolume: function() {
		return this.audio.volume;
	},
	setVolume: function(vol) {
		this.audio.volume = vol;
	},
	fadeOut: function(t) {
		var that = this;
		this.volumeFader = {
			time: 0,
			interp: Ptero.makeInterp('linear', [this.getVolume(), 0], [0, t]),
			update: function(dt) {
				this.time += dt;
				var vol = this.interp(this.time);
				if (vol == null) {
					that.volumeFader = null;
					that.stop();
				}
				else {
					that.setVolume(vol);
				}
			},
		};
	},
	play: function() {
		this.audio.src = this.filepath;
		this.setVolume(1);
		this.audio.play();
	},
};
