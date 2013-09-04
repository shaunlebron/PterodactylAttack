
Ptero.scene_options = (function(){

	var buttonList;

	var soundBtn;
	var vibrateBtn;
	var tutorialBtn;
	var handBtn;

	function cleanup() {
		buttonList.disable();
	}

	function setHand(hand) {
		Ptero.settings.setHand(hand);
		if (hand == 'left') {
			handBtn.text = "LEFT";
		}
		else if (hand == 'right') {
			handBtn.text = "RIGHT";
		}
	}
	function toggleHand() {
		var hand = Ptero.settings.getHand();
		setHand(hand == "left" ? "right" : "left");
	}

	function enableSound(on) {
		Ptero.settings.enableSound(on);
		soundBtn.text = (on ? "ON": "OFF");
	}
	function toggleSound() {
		var on = Ptero.settings.isSoundEnabled();
		enableSound(!on);
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
			Ptero.setScene(Ptero.scene_options);
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

		vibrateBtn = btns["vibrate"];
		vibrateBtn.onclick = toggleVibrate;

		tutorialBtn = btns["tutorial"];
		tutorialBtn.onclick = toggleTutorial;

		handBtn = btns["hand"];
		handBtn.onclick = toggleHand;

		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		enableTutorial(Ptero.settings.isTutorialEnabled());
		setHand(Ptero.settings.getHand());
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
