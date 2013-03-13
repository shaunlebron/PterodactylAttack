
Ptero.audio = (function() {
	var theme;

	function init() {
		theme = new Audio();
		theme.src = "audio/theme3.mp3"
	}

	return {
		init: init,
		getThemeSong: function() { return theme; },
	};
})();
