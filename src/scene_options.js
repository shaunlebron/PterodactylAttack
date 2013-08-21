
Ptero.scene_options = (function(){

	var backplate;
	var backplatePos;

	var backBtn;

	var soundBtn;
	var vibrateBtn;
	var tutorialBtn;
	var handBtn;

	var contentButtons;

	var wrenchBtn;
	var strongBtn;
	var scrollBtn;

	function cleanup() {
		var i,b,len=contentButtons.length;
		for (i=0; i<len; i++) {
			b = contentButtons[i];
			b.disable();
		}

		wrenchBtn.disable();
		strongBtn.disable();
		scrollBtn.disable();

		backBtn.disable();
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

	function enableTutorial(on) {
		Ptero.settings.enableTutorial(on);
		tutorialBtn.text = "TUTORIAL: " + (on ? "ON" : "OFF");
	}
	function toggleTutorial() {
		var on = Ptero.settings.isTutorialEnabled();
		enableTutorial(!on);
	}

	var time;
	function init() {
		time = 0;

		// backplate
		var w = 600;
		var h = 720;
		backplate = Ptero.assets.sprites["backplate_mountain"];
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		var screenW = Ptero.screen.getWidth();
		var scale = Ptero.screen.getScale();
		var startX = screenW/2 + w*scale/2;
		var midX = startX + (screenW - startX)/2;
		
		var hudFracX = midX / screenW;


		// side buttons
		wrenchBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_wrench'],
			hudPos: { x: hudFracX, y:0.2 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_options);
			},
		});
		wrenchBtn.enable();

		strongBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_strong'],
			hudPos: { x: hudFracX, y:0.5 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_highscore);
			},
		});
		strongBtn.enable();

		scrollBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_scroll'],
			hudPos: { x: hudFracX, y:0.8 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_credits);
			},
		});
		scrollBtn.enable();

		// back button
		backBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['btn_back'],
			hudPos: { x: 0.5, y:0.85 },
			isClickDelay: true,
			onclick: function() {
				Ptero.setScene(Ptero.scene_menu);
			},
		});
		backBtn.enable();


		// content
		var y = 0.15;
		var dy = 0.17;

		soundBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: y, },
			onclick: toggleSound,
		});
		soundBtn.enable();

		y += dy;
		vibrateBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: y, },
			onclick: toggleVibrate,
		});
		vibrateBtn.enable();

		y += dy;
		tutorialBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: y, },
			onclick: toggleTutorial,
		});
		tutorialBtn.enable();

		y += dy;
		handBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts['buttonfont'],
			textAlign: "center",
			hudPos: { x: 0.5, y: y, },
			onclick: toggleHand,
		});
		handBtn.enable();

		contentButtons = [
			soundBtn,
			vibrateBtn,
			tutorialBtn,
			handBtn,
		];

		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		enableTutorial(Ptero.settings.isTutorialEnabled());
		setHand(Ptero.settings.getHand());
	}

	function update(dt) {
		time += dt;
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		backplate.draw(ctx, backplatePos);

		var i,b,len=contentButtons.length;
		for (i=0; i<len; i++) {
			b = contentButtons[i];
			b.isEnabled && b.draw(ctx);
		}

		var alpha = 0.8;

		var backupAlpha = ctx.globalAlpha;
		ctx.globalAlpha = 1;
		wrenchBtn.draw(ctx);

		ctx.globalAlpha = alpha;
		strongBtn.draw(ctx);

		ctx.globalAlpha = alpha;
		scrollBtn.draw(ctx);

		ctx.globalAlpha = backupAlpha;

		backBtn.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		isVibrate: function() { return vibrate; },
	};

})();
