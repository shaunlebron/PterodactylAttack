
Ptero.audio = (function() {
	var titleSong;

	function init() {
		titleSong = new Ptero.Song("audio/theme3.mp3");
	}

	return {
		init: init,
		getTitleSong: function() { return titleSong; },
	};
})();

Ptero.Song = function(filepath) {
	this.filepath = filepath;
	this.audio = new Audio();
	this.audio.src = this.filepath;
};

Ptero.Song.prototype = {
	stop: function() {
		this.pause();
	},
	pause: function() {
		//this.audio.src = this.filepath;
		this.audio.pause();
	},
	play: function() {
		//this.audio.src = this.filepath;
		this.audio.play();
	},
};
