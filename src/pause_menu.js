
Ptero.pause_menu = (function(){

	var backplate;
	var backplatePos;

	var soundOnBtn;
	var soundOffBtn;
	var vibrateOnBtn;
	var vibrateOffBtn;
	var resumeBtn;
	var quitBtn;

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

	function init() {
		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		var dy = 1/5;
		resumeBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_resume'],
			hudPos: { x: 0.5, y: dy },
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.scene.enableControls();
			}
		});
		quitBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_quit'],
			hudPos: { x: 0.5, y: dy*4 },
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.setScene(Ptero.scene_pre_play);
			}
		});

		var soundPos = { x: 0.5, y: dy*2, };
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

		var vibratePos = { x: 0.5, y: dy*3, };
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

		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
	}

	function draw(ctx) {
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
		resumeBtn.draw(ctx);
		quitBtn.draw(ctx);
	}

	function cleanup() {
		soundOnBtn.disable();
		soundOffBtn.disable();
		vibrateOnBtn.disable();
		vibrateOffBtn.disable();
		resumeBtn.disable();
		quitBtn.disable();
	}

	function enable() {
		enableSound(Ptero.settings.isSoundEnabled());
		enableVibrate(Ptero.settings.isVibrateEnabled());
		resumeBtn.enable();
		quitBtn.enable();
		Ptero.scene.disableControls();
	}

	return {
		init: init,
		cleanup: cleanup,
		enable: enable,
		draw: draw,
	};
})();
