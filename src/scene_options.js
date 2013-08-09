
Ptero.scene_options = (function(){

	var backplate;
	var pos;

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

	var time;
	function init() {
		time = 0;
		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		pos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		var y = 0.2;
		var dy = 0.17;

		var soundPos = {
			x: 0.5,
			y: y,
		};
		soundOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_sound_on'],
			hudPos: soundPos,
			onclick: function() {
				// turn sound off
				soundOffBtn.enable();
				soundOnBtn.disable();
			},
		});
		soundOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_sound_off'],
			hudPos: soundPos,
			onclick: function() {
				// turn sound on
				soundOnBtn.enable();
				soundOffBtn.disable();
			},
		});

		soundOnBtn.enable();

		y += dy;
		var vibratePos = {
			x: 0.5,
			y: y,
		};
		vibrateOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_vibrate_on'],
			hudPos: vibratePos,
			onclick: function() {
				// turn vibrate off
				vibrateOffBtn.enable();
				vibrateOnBtn.disable();
			},
		});
		vibrateOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_vibrate_off'],
			hudPos: vibratePos,
			onclick: function() {
				// turn vibrate on
				vibrateOnBtn.enable();
				vibrateOffBtn.disable();
			},
		});

		vibrateOnBtn.enable();

		y += dy;
		var tutorialPos = {
			x: 0.5,
			y: y,
		};
		tutorialOnBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_tutorial_on'],
			hudPos: tutorialPos,
			onclick: function() {
				// turn tutorial off
				tutorialOffBtn.enable();
				tutorialOnBtn.disable();
			},
		});
		tutorialOffBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_tutorial_off'],
			hudPos: tutorialPos,
			onclick: function() {
				// turn tutorial on
				tutorialOnBtn.enable();
				tutorialOffBtn.disable();
			},
		});

		tutorialOnBtn.enable();

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
		backplate.fill(ctx,pos);

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
