
Ptero.scene_options = (function(){

	var backplate;
	var backplatePos;

	var backBtn;

	var soundOnBtn;
	var soundOffBtn;
	var vibrateOnBtn;
	var vibrateOffBtn;
	var tutorialOnBtn;
	var tutorialOffBtn;
	var lefthandBtn;
	var righthandBtn;

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
		lefthandBtn.disable();
		righthandBtn.disable();
		if (hand == 'left') {
			lefthandBtn.enable();
		}
		else if (hand == 'right') {
			righthandBtn.enable();
		}
	}

	function enableSound(on) {
		Ptero.settings.enableSound(on);
		soundOnBtn.disable();
		soundOffBtn.disable();
		if (on) {
			soundOnBtn.enable();
		}
		else {
			soundOffBtn.enable();
		}
	}
	function enableVibrate(on) {
		Ptero.settings.enableVibrate(on);
		vibrateOnBtn.disable();
		vibrateOffBtn.disable();
		if (on) {
			vibrateOnBtn.enable();
		}
		else {
			vibrateOffBtn.enable();
		}
	}
	function enableTutorial(on) {
		Ptero.settings.enableTutorial(on);
		tutorialOnBtn.disable();
		tutorialOffBtn.disable();
		if (on) {
			tutorialOnBtn.enable();
		}
		else {
			tutorialOffBtn.enable();
		}
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

		var soundPos = { x: 0.5, y: y, };
		soundOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_sound_on'],
			hudPos: soundPos,
			onclick: function() { enableSound(false); },
		});
		soundOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_sound_off'],
			hudPos: soundPos,
			onclick: function() { enableSound(true); },
		});

		y += dy;
		var vibratePos = { x: 0.5, y: y, };
		vibrateOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_vibrate_on'],
			hudPos: vibratePos,
			onclick: function() { enableVibrate(false); },
		});
		vibrateOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_vibrate_off'],
			hudPos: vibratePos,
			onclick: function() { enableVibrate(true); },
		});

		y += dy;
		var tutorialPos = { x: 0.5, y: y, };
		tutorialOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_tutorial_on'],
			hudPos: tutorialPos,
			onclick: function() { enableTutorial(false); },
		});
		tutorialOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_tutorial_off'],
			hudPos: tutorialPos,
			onclick: function() { enableTutorial(true); },
		});

		y += dy;
		var handPos = { x: 0.5, y: y, };
		lefthandBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_lefthanded'],
			hudPos: handPos,
			onclick: function() { setHand('right'); },
		});
		righthandBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_righthanded'],
			hudPos: handPos,
			onclick: function() { setHand('left'); },
		});

		contentButtons = [
			soundOnBtn,
			soundOffBtn,
			vibrateOnBtn,
			vibrateOffBtn,
			tutorialOnBtn,
			tutorialOffBtn,
			lefthandBtn,
			righthandBtn,
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
