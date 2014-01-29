
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
			if (Ptero.settings.isSoundEnabled()) {
				stop(name);
				sfx.play();
			}
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

	function setSoundVolume(vol) {
		// NOTE: Sorry for the confusing difference between "sounds" and "songs".
		// Some sounds are long and we need song functions for it, so they use Song objects.
		var name,sfx;
		for (name in Ptero.assets.songs) {
			sfx = Ptero.assets.songs[name];
			if (sfx.isSfx) {
				sfx.setVolume(vol * sfx.volumeScale);
			}
		}
	}

	function setMusicVolume(vol) {
		var name,song;
		for (name in Ptero.assets.songs) {
			song = Ptero.assets.songs[name];
			if (!song.isSfx) {
				song.setVolume(vol * song.volumeScale);
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
		setSoundVolume : setSoundVolume,
	};
})();

Ptero.Song = function(audio) {
	this.audio = audio;
	this.volumeScale = 1.0;
	this.isSfx = false;
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
		if (this.isSfx) {
			this.setVolume(Ptero.settings.getSoundVolume() * this.volumeScale);
		}
		else {
			this.setVolume(Ptero.settings.getMusicVolume() * this.volumeScale);
		}
		this.audio.play();
	},
};
