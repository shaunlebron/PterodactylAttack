
Ptero.scene_play = (function() {

	var KEY_SPACE = 32;
	var KEY_SHIFT = 16;
	var KEY_CTRL = 17;
	var KEY_ALT = 18;
	var KEY_A = 65;
	function onKeyDown(e) {
		if (e.keyCode == KEY_SPACE) {
			Ptero.executive.togglePause();
		}
		else if (e.keyCode == KEY_A) {
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

	var pauseBtn;
	var scoreBtn;
	var netLeftBtn, netRightBtn;

	function cleanup() {
		Ptero.bulletpool.clear();
		disableControls();
	}

	function enableControls() {
		pauseBtn.enable();
		if (isNetEnabled) {
			netBtn.enable();
		}
		Ptero.orb.enableTouch();
	}

	function disableControls() {
		netBtn.disable();
		pauseBtn.disable();
		Ptero.orb.disableTouch();
	}

	function refreshHandBtn() {
		netBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['net'],
			anchor: {
				x: Ptero.settings.getHand() == 'right' ? 'left' : 'right',
				y: "center",
			},
			ontouchstart: function(x,y) {
				Ptero.orb.enableNet(true);
			},
			ontouchend: function(x,y) {
				Ptero.orb.enableNet(false);
			},
			ontouchenter: function(x,y) {
				Ptero.orb.enableNet(true);
			},
			ontouchleave: function(x,y) {
				Ptero.orb.enableNet(false);
			},
		});
	}

	var time;
	var netBtn;
	function init() {

		Ptero.orb.enableGuide(false);

		// set the background
		setStage('mountain');
		Ptero.setBackground(stage);

		// create a random bounty
		Ptero.refreshBounty();

		// create the capture net button
		createNetBtn();

		// reset the score
		Ptero.score.reset();

		// create score button
		scoreBtn = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["scorefont"],
			textAlign: "right",
			text: Ptero.score.getScoreStr(),
			width: 400,
			height: 130,
			anchor: {
				x: "right",
				y: "top",
			},
		});

		// create the pause button
		pauseBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites["pause"],
			anchor: {x:"right",y:"bottom"},
			margin: 10,
			onclick: function() {
				Ptero.executive.togglePause();
				Ptero.pause_menu.enable();
			},
		});

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

	function resume() {
		//on resume, renable the pause menu
		Ptero.executive.togglePause();
		Ptero.pause_menu.enable();
		Ptero.orb.setTargets(Ptero.overlord.enemies);
	}

	function update(dt) {
		if (Ptero.player.health <= 0) {
			Ptero.fadeToScene(Ptero.scene_gameover, 0.25);
		}
		else {
			time += dt;
			if (time > 2) {
				Ptero.overlord.update(dt);
				Ptero.orb.update(dt);
				Ptero.bulletpool.deferBullets();
				Ptero.score.update(dt);
				netFlashTime = Math.max(0, netFlashTime-dt);
			}
		}
	};

	function draw(ctx) {
		if (!Ptero.executive.isPaused()) {
			Ptero.assets.keepExplosionsCached(ctx);
			//Ptero.background.draw(ctx);
			Ptero.deferredSprites.draw(ctx);
			Ptero.orb.draw(ctx);
			var point;
			if (Ptero.input.isTouched()) {
				point = Ptero.input.getWindowPoint();
				ctx.fillStyle = "rgba(255,255,255,0.2)";
				ctx.beginPath();
				ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
				ctx.fill();
			}
			if (time > 2) {
				pauseBtn.draw(ctx);

				scoreBtn.text = Ptero.score.getScoreStr();
				scoreBtn.draw(ctx);

				var isNetShown = isNetEnabled && (Math.floor(netFlashTime / netFlashPeriod) % 2 == 0);
				Ptero.player.drawHealth(ctx, isNetShown);
				if (isNetShown) {
					netBtn.draw(ctx);
				}
				Ptero.overlord.draw(ctx);
			}
		}
		else {
			Ptero.deferredSprites.draw(ctx);
			Ptero.pause_menu.draw(ctx);
		}

	};

	var stage;
	function getStage() {
		return stage;
	}
	function setStage(d) {
		stage = d;
	}

	var isNetEnabled = false;
	function enableNet(on) {
		isNetEnabled = on;
		if (on) {
			netBtn.enable();
		}
		else {
			netBtn.disable();
		}
	}

	return {
		init: init,
		resume: resume,
		update: update,
		draw: draw,
		createNetBtn: createNetBtn,
		cleanup:cleanup,
		disableControls: disableControls,
		enableControls: enableControls,
		getStage: getStage,
		setStage: setStage,
		enableNet: enableNet,
		flashNet: flashNet,
	};
})();
