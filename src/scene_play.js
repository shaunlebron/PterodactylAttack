
Ptero.scene_play = (function() {
	var overlord;

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
			Ptero.orb.enableNet(true);
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
	function cleanup() {
		Ptero.bulletpool.clear();
	}

	function enableControls() {
		pauseBtn.enable();
		netBtn.enable();
		Ptero.orb.enableTouch();
	}

	function disableControls() {
		netBtn.disable();
		pauseBtn.disable();
		Ptero.orb.disableTouch();
	}

	var time;
	var netBtn;
	function init() {

		Ptero.orb.enableGuide(false);

		// set the background
		Ptero.setBackground(stage);

		// create a random bounty
		Ptero.refreshBounty();

		// create the overlord to manage the enemies
		overlord = Ptero.makeOverlord();
		overlord.init();

		// create the capture net button
		netBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['net'],
			anchor: {
				x: "left",
				y: "center",
			},
		});
		netBtn.ontouchstart = function(x,y) {
			Ptero.orb.enableNet(true);
		}
		netBtn.ontouchend = function(x,y) {
			Ptero.orb.enableNet(false);
		}
		netBtn.ontouchenter = function(x,y) {
			Ptero.orb.enableNet(true);
		}
		netBtn.ontouchleave = function(x,y) {
			Ptero.orb.enableNet(false);
		}

		// reset the score
		Ptero.score.reset();

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

		// initialize orb
		Ptero.orb.init();
		Ptero.orb.setTargets(overlord.enemies);
        Ptero.orb.setNextOrigin(0,-1);

		// add keyboard events
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		// initialize pause menu
		Ptero.pause_menu.init();

		// initialize options screen attributes
		Ptero.scene_options.setReturnScene(this);
		Ptero.scene_options.setResumeOnReturn(true);

		// enable input
		enableControls();
	};

	function resume() {
		//on resume, renable the pause menu
		Ptero.executive.togglePause();
		Ptero.pause_menu.enable();
		Ptero.orb.setTargets(overlord.enemies);
	}

	function update(dt) {
		if (Ptero.player.health <= 0) {
			Ptero.fadeToScene(Ptero.scene_gameover, 0.25);
		}
		else {

			time += dt;
			if (time > 2) {
				overlord.update(dt);
				Ptero.orb.update(dt);
				Ptero.bulletpool.deferBullets();
				Ptero.score.update(dt);
			}
		}
	};

	function draw(ctx) {
		function drawText(text) {
			var size = Ptero.hud.getTextSize('menu_option');
			ctx.font = size + "px SharkParty";
			ctx.fillStyle = "#FFF";
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";
			var frustum = Ptero.screen.getFrustum();
			var p = Ptero.screen.spaceToScreen({
				x: 0,
				y: frustum.nearTop/2,
				z: frustum.near,
			});
			ctx.fillText(text, p.x, p.y);
		}

		if (!Ptero.executive.isPaused()) {
			Ptero.assets.keepExplosionsCached(ctx);
			//Ptero.background.draw(ctx);
			Ptero.deferredSprites.draw(ctx);
			Ptero.orb.draw(ctx);
			var point;
			if (Ptero.input.isTouched()) {
				point = Ptero.input.getPoint();
				ctx.fillStyle = "rgba(255,255,255,0.2)";
				ctx.beginPath();
				ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
				ctx.fill();
			}
			if (time > 2) {
				pauseBtn.draw(ctx);
				Ptero.score.draw(ctx);
				Ptero.player.drawHealth(ctx);
				netBtn.draw(ctx);
			}

			if (time < 2) {
				drawText("Survive as long as you can!");
			}
			else if (time < 4) {
				//drawText("New wave approaching!");
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

	return {
		init: init,
		resume: resume,
		update: update,
		draw: draw,
		cleanup:cleanup,
		disableControls: disableControls,
		enableControls: enableControls,
		getStage: getStage,
		setStage: setStage,
	};
})();
