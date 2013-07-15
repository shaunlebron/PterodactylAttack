
Ptero.scene_survivor = (function() {
	var enemies = [];
	var numEnemies;

	var KEY_SPACE = 32;
	var KEY_SHIFT = 16;
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
	}
	
	function onKeyUp(e) {
		if (e.keyCode == KEY_SHIFT) {
			Ptero.executive.regmo();
		}
	}

	var pauseBtn,timerDisplay;
	function cleanup() {
		Ptero.bulletpool.clear();
	}

	function enableControls() {
		pauseBtn.enable();
		Ptero.orb.enableTouch();
	}

	function disableControls() {
		pauseBtn.disable();
		Ptero.orb.disableTouch();
	}

	var levelCount = 0;
	function setLevel(level) {
		enemies.length = 0;

		var waves = level.waves;
		var numWaves = waves.length;
		var i,wave,t;
		var j;
		var maxTime = 0;
		var models, numModels;

		// iterate each wave
		for (i=0; i<numWaves; i++) {

			// get starting time of this wave
			t = waves[i].startTime;

			// get this wave (group of enemies)
			models = waves[i].models;
			numModels = models.length;

			// iterate each enemy in wave
			for (j=0; j<numModels; j++) {

				// create enemy
				var e = Ptero.Enemy.fromState(models[j], t);

				// add enemy to this scene's enemies
				enemies.push(e);

				// consolidate max time
				maxTime = Math.max(maxTime, e.path.totalTime);
			}
		}

		// create a timer to countdown to the last moment
		timerDisplay = new Ptero.TimerDisplay(maxTime);
		time = 2;


		numEnemies = enemies.length;
	}

	var time;
	function init() {

		Ptero.score.reset();

		Ptero.orb.allowTapToSelect(true);

		pauseBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites["pause"],
			anchor: {x:"right",y:"bottom"},
			margin: 10,
			onclick: function() {
				Ptero.executive.togglePause();
				Ptero.pause_menu.enable();
			},
		});

		Ptero.player = new Ptero.Player();

		setLevel(Ptero.assets.json["survival01"]);
		levelCount++;

		time = 0;

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		Ptero.pause_menu.init();

		Ptero.scene_options.setReturnScene(this);
		Ptero.scene_options.setResumeOnReturn(true);
		enableControls();
	};

	function resume() {
		//on resume, renable the pause menu
		Ptero.executive.togglePause();
		Ptero.pause_menu.enable();
		Ptero.orb.setTargets(enemies);
	}

	function update(dt) {
		if (Ptero.player.health <= 0) {
			Ptero.scene_gameover.setReplayScene(this);
			Ptero.fadeToScene(Ptero.scene_gameover, 0.25);
		}
		else {

			time += dt;
			if (time > 2) {
				var i;
				for (i=0; i<numEnemies; i++) {
					enemies[i].update(dt);
					var pos = enemies[i].getPosition();
					if (pos) {
						Ptero.deferredSprites.defer(
							(function(e) {
								return function(ctx){
									e.draw(ctx);
								};
							})(enemies[i]),
							pos.z);
					}
				}
				Ptero.orb.update(dt);
				Ptero.bulletpool.deferBullets();
				Ptero.score.update(dt);

				timerDisplay.update(dt);
				if (timerDisplay.isDone()) {
					var l = (levelCount%3)+1;
					setLevel(Ptero.assets.json["survival0"+l]);
					levelCount++;
				}
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
			}
			//timerDisplay.draw(ctx);

			if (time < 2) {
				drawText("Survive as long as you can!");
			}
			else if (time < 4) {
				drawText("New wave approaching!");
			}
		}
		else {
			Ptero.deferredSprites.draw(ctx);
			Ptero.pause_menu.draw(ctx);
		}

	};

	var difficulty;
	function getDifficulty() {
		return difficulty;
	}
	function setDifficulty(d) {
		difficulty = d;
	}

	return {
		init: init,
		resume: resume,
		update: update,
		draw: draw,
		cleanup:cleanup,
		disableControls: disableControls,
		enableControls: enableControls,
		getDifficulty: getDifficulty,
		setDifficulty: setDifficulty,
	};
})();
