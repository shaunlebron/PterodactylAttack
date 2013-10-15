
Ptero.audio = (function() {

	function stop(name) {
		var sfx = Ptero.assets.sfx[name];
		if (sfx) {
			sfx.pause();
			sfx.currentTime = 0;
			return;
		}

		var song = Ptero.assets.songs[name];
		if (song) {
			song.stop();
			return;
		}
	}

	function pause(name) {
		var sfx = Ptero.assets.sfx[name];
		if (sfx) {
			sfx.pause();
			return;
		}

		var song = Ptero.assets.songs[name];
		if (song) {
			song.pause();
			return;
		}
	}

	function play(name) {
		var sfx = Ptero.assets.sfx[name];
		if (sfx) {
			Ptero.settings.isSoundEnabled() && sfx.play();
			return;
		}

		var song = Ptero.assets.songs[name];
		if (song) {
			song.play();
			return;
		}
	}

	function fadeOut(name,t) {
		var song = Ptero.assets.songs[name];
		if (song) {
			song.fadeOut(t);
		}
	}

	function update(dt) {
		var name,song;
		for (name in Ptero.assets.songs) {
			song = Ptero.assets.songs[name];
			song.update(dt);
		}
	}
	
	function setMusicVolume(vol) {
		var name,song;
		for (name in Ptero.assets.songs) {
			song = Ptero.assets.songs[name];
			if (song.initVolume == null) {
				song.setVolume(vol);
			}
		}
	}

	return {
		update         : update,
		play           : play,
		pause          : pause,
		stop           : stop,
		fadeOut        : fadeOut,
		setMusicVolume : setMusicVolume,
	};
})();

Ptero.Song = function(audio) {
	this.audio = audio;
	this.initVolume = null;
};

Ptero.Song.prototype = {
	setContinueSong: function(song) {
		this.audio.addEventListener('ended', function() {
			song.play();
		});
	},
	setLoop: function() {
		// from: http://stackoverflow.com/a/6452884/142317
		if (typeof this.audio.loop == 'boolean')
		{
			this.audio.loop = true;
		}
		else
		{
			this.audio.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
		}
	},
	update: function(dt) {
		if (this.volumeFader) {
			this.volumeFader.update(dt);
		}
	},
	stop: function() {
		this.pause();
		this.audio.currentTime = 0;
	},
	pause: function() {
		this.audio.pause();
	},
	getVolume: function() {
		return this.audio.volume;
	},
	setVolume: function(vol) {
		this.audio.volume = vol;
	},
	setInitVolume: function(vol) {
		this.initVolume = vol;
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
		if (this.initVolume != null) {
			this.setVolume(this.initVolume);
		}
		else {
			this.setVolume(Ptero.settings.getMusicVolume());
		}
		this.audio.play();
	},
};
