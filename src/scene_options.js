
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

	function cleanup() {
		soundOnBtn.disable();
		soundOffBtn.disable();
		vibrateOnBtn.disable();
		vibrateOffBtn.disable();
		tutorialOnBtn.disable();
		tutorialOffBtn.disable();
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

		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

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

		backBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['btn_back'],
			hudPos: { x: 0.5, y:0.8 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_menu);
			},
		});
		backBtn.enable();
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
