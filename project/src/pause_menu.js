
Ptero.pause_menu = (function(){

	var buttonList;

	var soundBtn;
	var musicBtn;
	var vibrateBtn;
	var netSideBtn;
	var skipBtn;

	function disable() {
		buttonList.disable();
	}

	function enable() {
		buttonList.enable();
		if (!Ptero.settings.isTutorialEnabled()) {
			skipBtn.disable();
		}

		enableSound(Ptero.settings.isSoundEnabled());
		enableMusic(Ptero.settings.isMusicEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		setNetSide(Ptero.settings.getNetSide());
	}

	function setNetSide(side) {
		Ptero.settings.setNetSide(side);
		if (side == 'left') {
			netSideBtn.text = "<<<";
		}
		else if (side == 'right') {
			netSideBtn.text = ">>>";
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

		skipBtn = btns["skip"];
		skipBtn.onclick = function() {
			Ptero.scene_play.exitTutorial();
		};
		if (Ptero.settings.isTutorialEnabled()) {
			skipBtn.shouldDraw = true;
		}
		else {
			skipBtn.shouldDraw = false;
		}

		soundBtn = btns["sound"];
		soundBtn.onclick = toggleSound;

		musicBtn = btns["music"];
		musicBtn.onclick = toggleMusic;

		vibrateBtn = btns["vibrate"];
		vibrateBtn.onclick = toggleVibrate;

		netSideBtn = btns["netSide"];
		netSideBtn.onclick = toggleNetSide;

		btns["resume"].onclick = function() {
			Ptero.scene_play.unpause();
		};

		btns["quit"].onclick = function() {
			Ptero.scene_play.unpause();
			Ptero.setScene(Ptero.scene_menu);
			Ptero.audio.play("theme");
		};
	}

	function draw(ctx) {

		var maxDisplacement = Ptero.screen.getWindowWidth();
		var alpha = (displacement / maxDisplacement - 1) * -0.5;
		ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
		ctx.fillRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());

		ctx.save();
		ctx.translate(displacement, 0);

		buttonList.draw(ctx);
		ctx.restore();
	}
	
	function update(dt) {
		updateDisplacement(dt);
	}

	var displacement = 0;

	// update displacement with a factor-based deceleration that is framerate independent
	var updateDisplacement = (function(){
		var time = 0;
		var step = 1/60;
		return function(dt) {
			time += dt;
			while (time - step >= 0) {
				time -= step;
				displacement *= 0.7;
			}
		};
	})();

	function animateIn() {
		displacement = Ptero.screen.getWindowWidth();
	}

	return {
		animateIn: animateIn,
		init: init,
		update: update,
		disable: disable,
		enable: enable,
		draw: draw,
	};
})();
