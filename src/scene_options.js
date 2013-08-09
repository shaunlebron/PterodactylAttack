
Ptero.scene_options = (function(){

	var backplate;
	var backplatePos;

	var soundOnBtn;
	var soundOffBtn;
	var vibrateOnBtn;
	var vibrateOffBtn;
	var tutorialOnBtn;
	var tutorialOffBtn;
	var backBtn;

	var wrenchBtn;
	var strongBtn;
	var scrollBtn;

	function cleanup() {
		soundOnBtn.disable();
		soundOffBtn.disable();
		vibrateOnBtn.disable();
		vibrateOffBtn.disable();
		tutorialOnBtn.disable();
		tutorialOffBtn.disable();

		wrenchBtn.disable();
		strongBtn.disable();
		scrollBtn.disable();

		backBtn.disable();
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
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
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
			hudPos: { x: 0.5, y:0.8 },
			isClickDelay: true,
			onclick: function() {
				Ptero.setScene(Ptero.scene_menu);
			},
		});
		backBtn.enable();


		// content
		var y = 0.2;
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

		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		enableTutorial(Ptero.settings.isTutorialEnabled());

	}

	function update(dt) {
		time += dt;
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		ctx.fillStyle = "rgba(0,0,0,0.7)";
		backplate.fill(ctx, backplatePos);

		if (soundOnBtn.isEnabled) {
			soundOnBtn.draw(ctx);
		}
		else {
			soundOffBtn.draw(ctx);
		}

		if (vibrateOnBtn.isEnabled) {
			vibrateOnBtn.draw(ctx);
		}
		else {
			vibrateOffBtn.draw(ctx);
		}

		if (tutorialOnBtn.isEnabled) {
			tutorialOnBtn.draw(ctx);
		}
		else {
			tutorialOffBtn.draw(ctx);
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
