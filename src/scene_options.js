
Ptero.scene_options = (function(){

	var buttonList;

	var soundBtn;
	var musicBtn;
	var vibrateBtn;
	var tutorialBtn;
	var netSideBtn;

	function cleanup() {
		buttonList.disable();
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

	function enableTutorial(on) {
		Ptero.settings.enableTutorial(on);
		tutorialBtn.text = (on ? "ON" : "OFF");
	}
	function toggleTutorial() {
		var on = Ptero.settings.isTutorialEnabled();
		enableTutorial(!on);
	}

	function init() {

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_options"]);
		buttonList.enable();

		var btns = buttonList.namedButtons;

		btns["wrench"].onclick = function() {
			//Ptero.setScene(Ptero.scene_options);
		};

		btns["strong"].onclick = function() {
			Ptero.setScene(Ptero.scene_highscore);
		};

		btns["scroll"].onclick = function() {
			Ptero.setScene(Ptero.scene_credits);
		};

		var b = btns["back"];
		b.isClickDelay = true;
		b.onclick = function() {
			Ptero.setScene(Ptero.scene_menu);
		};

		soundBtn = btns["sound"];
		soundBtn.onclick = toggleSound;

		musicBtn = btns["music"];
		musicBtn.onclick = toggleMusic;

		vibrateBtn = btns["vibrate"];
		vibrateBtn.onclick = toggleVibrate;

		tutorialBtn = btns["tutorial"];
		tutorialBtn.onclick = toggleTutorial;

		netSideBtn = btns["netSide"];
		netSideBtn.onclick = toggleNetSide;

		enableSound(Ptero.settings.isSoundEnabled());
		enableMusic(Ptero.settings.isMusicEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		enableTutorial(Ptero.settings.isTutorialEnabled());
		setNetSide(Ptero.settings.getNetSide());
	}

	function update(dt) {
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		buttonList.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
