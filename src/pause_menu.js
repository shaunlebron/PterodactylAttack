
Ptero.pause_menu = (function(){

	var backplate;
	var backplatePos;

	var resumeBtn;
	var quitBtn;

	var soundBtn;
	var vibrateBtn;
	var handBtn;

	var contentButtons;

	function cleanup() {
		var i,b,len=contentButtons.length;
		for (i=0; i<len; i++) {
			b = contentButtons[i];
			b.disable();
		}
		resumeBtn.disable();
		quitBtn.disable();
	}

	function enable() {
		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		setHand(Ptero.settings.getHand());

		soundBtn.enable();
		vibrateBtn.enable();
		handBtn.enable();

		resumeBtn.enable();
		quitBtn.enable();
		Ptero.scene.disableControls();
	}

	function setHand(hand) {
		Ptero.settings.setHand(hand);
		if (hand == 'left') {
			handBtn.text = "LEFT-HANDED";
		}
		else if (hand == 'right') {
			handBtn.text = "RIGHT-HANDED";
		}
	}
	function toggleHand() {
		var hand = Ptero.settings.getHand();
		setHand(hand == "left" ? "right" : "left");
	}

	function enableSound(on) {
		Ptero.settings.enableSound(on);
		soundBtn.text = "SOUND: " + (on ? "ON": "OFF");
	}
	function toggleSound() {
		var on = Ptero.settings.isSoundEnabled();
		enableSound(!on);
	}

	function enableVibrate(on) {
		Ptero.settings.enableVibrate(on);
		vibrateBtn.text = "VIBRATE: " + (on ? "ON" : "OFF");
	}
	function toggleVibrate() {
		var on = Ptero.settings.isVibrateEnabled();
		enableVibrate(!on);
	}

	function init() {

		// create backplate
		var w = 600;
		var h = 720;
		backplate = {
			"mountain" : Ptero.assets.sprites['backplate_mountain'],
			"ice"      : Ptero.assets.sprites['backplate_ice'],
			"volcano"  : Ptero.assets.sprites['backplate_ice'],
		}[Ptero.background.name];
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		// create resume and quit buttons
		var dy = 1/6;
		resumeBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			text: "RESUME",
			hudPos: { x: 0.5, y: dy, },
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.scene.enableControls();
			}
		});
		quitBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			text: "QUIT",
			hudPos: { x: 0.5, y: dy*5, },
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.setScene(Ptero.scene_menu);
			}
		});

		// create settings buttons
		soundBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: dy*2, },
			onclick: toggleSound,
		});

		vibrateBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: dy*3, },
			onclick: toggleVibrate,
		});

		handBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: dy*4, },
			onclick: function() {
				toggleHand();
				Ptero.scene_play.createNetBtn();
			},
		});

		contentButtons = [
			soundBtn,
			vibrateBtn,
			handBtn,
		];
	}

	function draw(ctx) {
		backplate.draw(ctx, backplatePos);

		var i,b,len=contentButtons.length;
		for (i=0; i<len; i++) {
			b = contentButtons[i];
			b.draw(ctx);
		}

		resumeBtn.draw(ctx);
		quitBtn.draw(ctx);
	}

	return {
		init: init,
		cleanup: cleanup,
		enable: enable,
		draw: draw,
	};
})();
