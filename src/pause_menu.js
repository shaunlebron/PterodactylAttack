
Ptero.pause_menu = (function(){

	var buttonList;

	var soundBtn;
	var musicBtn;
	var vibrateBtn;
	var netSideBtn;

	function cleanup() {
		buttonList.disable();
	}

	function enable() {
		buttonList.enable();

		enableSound(Ptero.settings.isSoundEnabled());
		enableMusic(Ptero.settings.isMusicEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		setNetSide(Ptero.settings.getNetSide());

		Ptero.scene.disableControls();
	}

	function setNetSide(side) {
		Ptero.settings.setNetSide(side);
		if (side == 'left') {
			netSideBtn.text = "LEFT";
		}
		else if (side == 'right') {
			netSideBtn.text = "RIGHT";
		}
	}
	function toggleNetSide() {
		var side = Ptero.settings.getNetSide();
		setNetSide(side == "left" ? "right" : "left");
	}

	function enableSound(on) {
		Ptero.settings.enableSound(on);
		soundBtn.text = (on ? "ON": "OFF");
	}
	function toggleSound() {
		var on = Ptero.settings.isSoundEnabled();
		enableSound(!on);
	}

	function enableMusic(on) {
		Ptero.settings.enableMusic(on);
		musicBtn.text = (on ? "ON": "OFF");
	}
	function toggleMusic() {
		var on = Ptero.settings.isMusicEnabled();
		enableMusic(!on);
	}

	function enableVibrate(on) {
		Ptero.settings.enableVibrate(on);
		vibrateBtn.text = (on ? "ON" : "OFF");
	}
	function toggleVibrate() {
		var on = Ptero.settings.isVibrateEnabled();
		enableVibrate(!on);
	}

	function init() {

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_pause"]);

		var btns = buttonList.namedButtons;

		soundBtn = btns["sound"];
		soundBtn.onclick = toggleSound;

		musicBtn = btns["music"];
		musicBtn.onclick = toggleMusic;

		vibrateBtn = btns["vibrate"];
		vibrateBtn.onclick = toggleVibrate;

		netSideBtn = btns["netSide"];
		netSideBtn.onclick = toggleNetSide;

		btns["resume"].onclick = function() {
			Ptero.executive.togglePause();
			cleanup();
			Ptero.scene.enableControls();
		};

		btns["quit"].onclick = function() {
			Ptero.executive.togglePause();
			cleanup();
			Ptero.setScene(Ptero.scene_menu);
		};
	}

	function draw(ctx) {
		buttonList.draw(ctx);
	}

	return {
		init: init,
		cleanup: cleanup,
		enable: enable,
		draw: draw,
	};
})();
