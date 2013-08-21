
Ptero.pause_menu = (function(){

	var backplate;
	var backplatePos;

	var resumeBtn;
	var quitBtn;

	var soundOnBtn;
	var soundOffBtn;
	var vibrateOnBtn;
	var vibrateOffBtn;
	var tutorialOnBtn;
	var tutorialOffBtn;
	var lefthandBtn;
	var righthandBtn;

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

		resumeBtn.enable();
		quitBtn.enable();
		Ptero.scene.disableControls();
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
			hudPos: { x: 0.5, y: dy*5 },
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.setScene(Ptero.scene_menu);
			}
		});

		// create settings buttons
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

		var handPos = { x: 0.5, y: dy*4, };
		lefthandBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_lefthanded'],
			hudPos: handPos,
			onclick: function() {
				setHand('right');
				Ptero.scene_play.createNetBtn();
			},
		});
		righthandBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_righthanded'],
			hudPos: handPos,
			onclick: function() {
				setHand('left');
				Ptero.scene_play.createNetBtn();
			},
		});

		contentButtons = [
			soundOnBtn,
			soundOffBtn,
			vibrateOnBtn,
			vibrateOffBtn,
			lefthandBtn,
			righthandBtn,
		];
	}

	function draw(ctx) {
		backplate.draw(ctx, backplatePos);

		var i,b,len=contentButtons.length;
		for (i=0; i<len; i++) {
			b = contentButtons[i];
			b.isEnabled && b.draw(ctx);
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
