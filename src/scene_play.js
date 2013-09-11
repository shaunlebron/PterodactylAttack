
Ptero.scene_play = (function() {

	var state;

	var isPaused = false;
	function pause() {
		isPaused = true;
		disableControls();
		Ptero.pause_menu.enable();
		Ptero.pause_menu.animateIn();
	}
	function unpause() {
		isPaused = false;
		Ptero.pause_menu.disable();
		enableControls();
	}

	var KEY_SPACE = 32;
	var KEY_SHIFT = 16;
	var KEY_CTRL = 17;
	var KEY_ALT = 18;
	var KEY_A = 65;
	function onKeyDown(e) {
		if (e.keyCode == KEY_A) {
			Ptero.orb.toggleDrawCones();
		}
		else if (e.keyCode == KEY_SHIFT) {
			Ptero.executive.slowmo();
		}
		else if (e.keyCode == KEY_ALT) {
			if (isNetEnabled) {
				Ptero.orb.enableNet(true);
			}
			e.preventDefault();
		}
	}
	
	function onKeyUp(e) {
		if (e.keyCode == KEY_SHIFT) {
			Ptero.executive.regmo();
		}
		else if (e.keyCode == KEY_ALT) {
			Ptero.orb.enableNet(false);
		}
	}

	var buttonList;

	var pauseBtn;
	var scoreBtn;
	var netLeftBtn, netRightBtn;

	function cleanup() {
		Ptero.bulletpool.clear();
		disableControls();
	}

	function enableControls() {
		buttonList.enable();
		if (isNetEnabled) {
			enableNet(true);
		}
		Ptero.orb.enableTouch();
	}

	function disableControls() {
		buttonList.disable();
		Ptero.orb.disableTouch();
	}

	var time;
	function init() {
		isPaused = false;

		Ptero.orb.enableGuide(false);

		// set the background
		switchBackground('mountain');

		// reset the score
		Ptero.score.reset();

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_game"]);
		var btns = buttonList.namedButtons;

		scoreBtn = btns["score"];

		pauseBtn = btns["pause"];
		pauseBtn.onclick = pause;

		netLeftBtn = btns["netLeft"];
		netRightBtn = btns["netRight"];
		netLeftBtn.ontouchstart = netRightBtn.ontouchstart = function(x,y) { Ptero.orb.enableNet(true); };
		netLeftBtn.ontouchend   = netRightBtn.ontouchend   = function(x,y) { Ptero.orb.enableNet(false); };
		netLeftBtn.ontouchenter = netRightBtn.ontouchenter = function(x,y) { Ptero.orb.enableNet(true); };
		netLeftBtn.ontouchleave = netRightBtn.ontouchleave = function(x,y) { Ptero.orb.enableNet(false); };

		// create a player to hold player attributes such as health.
		Ptero.player = new Ptero.Player();

		// initialize our clock for internal events
		time = 0;

		// create the overlord to manage the enemies
		Ptero.overlord = Ptero.makeOverlord();
		Ptero.overlord.init();

		// initialize orb
		Ptero.orb.init();
		Ptero.orb.setTargets(Ptero.overlord.enemies);
		Ptero.orb.setNextOrigin(0,-1);

		// add keyboard events
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		// initialize pause menu
		Ptero.pause_menu.init();

		// enable input
		enableControls();
	};

	var hud = (function(){

		var alpha;
		var timer;

		function hide() {
			alpha = null;
		}

		function fadeIn(t, onDone) {
			state = "fade-in";
			var duration = 0.25;
			var interp = Ptero.makeInterp('linear', [0,1], [0, duration]);
			timer = new Ptero.Timer({
				limit: duration,
				onUpdate: function(dt,t) {
					alpha = interp(t);
				},
				onFinish: function() {
					alpha = 1;
					timer = null;
					onDone && onDone();
				},
			});
		}

		function fadeOut(t, onDone) {
			state = "fade-out";
			var duration = 0.25;
			var interp = Ptero.makeInterp('linear', [1,0], [0, duration]);
			timer = new Ptero.Timer({
				limit: duration,
				onUpdate: function(dt,t) {
					alpha = interp(t);
				},
				onFinish: function() {
					alpha = 0;
					timer = null;
					onDone && onDone();
				},
			});
		}

		function update(dt) {
			timer && timer.update(dt);
		}

		function draw(ctx) {
			if (alpha) {
				ctx.globalAlpha = alpha;
				Ptero.player.drawHealth(ctx, isNetEnabled);
				buttonList.draw(ctx);
				ctx.globalAlpha = 1;
			}
		}

		return {
			hide: hide,
			fadeIn: fadeIn,
			fadeOut: fadeOut,
			update: update,
			draw: draw,
		};
	})();

	function fadeToNextStage(onDone) {
		hud.fadeOut(1, function() {
			var nextName = Ptero.getNextBgName();
			Ptero.background.exit();
			Ptero.background.onExitDone = function() {
				switchBackground(nextName);
				onDone && onDone();
			};
		});
	}

	function switchBackground(name) {
		state = "intro";
		hud.hide();
		Ptero.setBackground(name);
		Ptero.background.onIdle = function() {
			hud.fadeIn(1, function(){
				state = "active";
			});
		};
	}

	function update(dt) {
		if (!isPaused) {
			if (Ptero.player.health <= 0) {
				Ptero.fadeToScene(Ptero.scene_gameover, 0.25);
			}
			else {
				time += dt;
				hud.update(dt);
				if (state == "active") {
					Ptero.overlord.update(dt);
					Ptero.orb.update(dt);
					Ptero.bulletpool.deferBullets();
					Ptero.score.update(dt);
				}
			}
		}
		else {
			Ptero.overlord.update(0);
			Ptero.bulletpool.deferBullets();
			Ptero.pause_menu.update(dt);
		}
	};

	function draw(ctx) {
		if (!isPaused) {
			Ptero.assets.keepExplosionsCached(ctx);
			Ptero.deferredSprites.draw(ctx);
			var point;
			if (Ptero.input.isTouched()) {
				point = Ptero.input.getWindowPoint();
				ctx.fillStyle = "rgba(255,255,255,0.2)";
				ctx.beginPath();
				ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
				ctx.fill();
			}

			scoreBtn.text = Ptero.score.getScoreStr();

			hud.draw(ctx);

			if (state == "active") {
				Ptero.orb.draw(ctx);
				Ptero.overlord.draw(ctx);
			}
		}
		else {
			Ptero.deferredSprites.draw(ctx);
			Ptero.pause_menu.draw(ctx);
		}

	};

	var isNetEnabled = false;
	function enableNet(on) {
		isNetEnabled = on;

		netLeftBtn.disable();
		netRightBtn.disable();
		netLeftBtn.shouldDraw = netRightBtn.shouldDraw = false;

		var side = Ptero.settings.getNetSide();
		if (on) {
			if (side == 'left') {
				netLeftBtn.enable();
				netLeftBtn.shouldDraw = true;
			}
			else if (side == 'right') {
				netRightBtn.enable();
				netRightBtn.shouldDraw = true;
			}
		}
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		enableNet: enableNet,
		pause: pause,
		unpause: unpause,
		fadeToNextStage: fadeToNextStage,
	};
})();
