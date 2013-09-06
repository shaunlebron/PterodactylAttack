
Ptero.audio = (function() {
	var titleSong,scoreSong;
	var shoot,explode,hurt;
	var bountyCorrect, bountyWrong, bountyComplete;
	var net;
	var select;

	var initialized = false;

	function init() {
		initialized = true;

		shoot   = new Audio("audio/shoot04.wav");
		explode = new Audio("audio/explode04.wav");
		hurt    = new Audio("audio/hurt.wav");
		select  = new Audio("audio/select04.wav");

		bountyCorrect  = new Audio('audio/bounty_correct.wav');
		bountyWrong    = new Audio('audio/bounty_wrong.wav');
		bountyComplete = new Audio('audio/bounty_complete.wav');

		net = new Audio('audio/net.wav');

		titleSong = new Ptero.Song("audio/theme3");
		scoreSong = new Ptero.Song("audio/score");
	}

	function update(dt) {
		if (initialized) {
			titleSong.update(dt);
			scoreSong.update(dt);
		}
	}

	return {
		init: init,
		update: update,
		playSelect: function() { select.play(); },
		playShoot: function() { shoot.play(); },
		playExplode: function() { explode.play(); },
		playHurt: function() { hurt.play(); },
		playBountyCorrect: function() { bountyCorrect.play(); },
		playBountyWrong: function() { bountyWrong.play(); },
		playBountyComplete: function() { bountyComplete.play(); },
		playNet: function() { net.play(); },
		getTitleSong: function() { return titleSong; },
		getScoreSong: function() { return scoreSong; },
	};
})();

Ptero.Song = function(filepath) {
	var audio = new Audio();

	if (audio.canPlayType('audio/ogg')) {
		audio.src = filepath+".ogg";
	}
	else if (audio.canPlayType('audio/mp3')) {
		audio.src = filepath+".mp3";
	}
	else {
		audio = null;
	}

	this.audio = audio;
};

Ptero.Song.prototype = {
	setLoop: function() {
		if (!this.audio) {
			return;
		}

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
		if (!this.audio) {
			return;
		}

		if (this.volumeFader) {
			this.volumeFader.update(dt);
		}
	},
	stop: function() {
		if (!this.audio) {
			return;
		}

		this.pause();
		this.audio.currentTime = 0;
	},
	pause: function() {
		if (!this.audio) {
			return;
		}

		this.audio.pause();
	},
	getVolume: function() {
		if (!this.audio) {
			return 0;
		}

		return this.audio.volume;
	},
	setVolume: function(vol) {
		if (!this.audio) {
			return;
		}

		this.audio.volume = vol;
	},
	fadeOut: function(t) {
		if (!this.audio) {
			return;
		}

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
		if (!this.audio) {
			return;
		}

		this.setVolume(1);
		this.audio.play();
	},
};
