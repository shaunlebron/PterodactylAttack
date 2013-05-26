
Ptero.scene_predefined_paths = (function() {
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

	var pauseBtn,playBtn,timerDisplay;
	function cleanup() {
		pauseBtn.disable();
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
	}

	function setLevel(level) {
		enemies.length = 0;

		var waves = level.waves;
		var numWaves = waves.length;
		var i,wave,t;
		var j,points;
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

				// get control points for this enemy
				points = models[j].points;

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

		numEnemies = enemies.length;
	}

	function init() {
		Ptero.score.reset();

		pauseBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites["pause"],
			anchor: {x:"right",y:"bottom"},
			margin: 10,
			onclick: function() {
				Ptero.executive.togglePause();
				pauseBtn.disable();
				playBtn.enable();
				Ptero.orb.disableTouch();
			},
		});
		pauseBtn.enable();

		playBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites["play"],
			anchor: {x:"center",y:"center"},
			onclick: function() {
				Ptero.executive.togglePause();
				playBtn.disable();
				pauseBtn.enable();
				Ptero.orb.enableTouch();
			}
		});



		setLevel(Ptero.assets.levels["fourier"]);
		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	};

	function update(dt) {
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
			Ptero.scene_gameover.setReplayScene(this);
			Ptero.fadeToScene(Ptero.scene_gameover, 0.25);
		}
	};

	function draw(ctx) {
		if (!Ptero.executive.isPaused()) {
			Ptero.assets.keepExplosionsCached(ctx);
			Ptero.background.draw(ctx);
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
			pauseBtn.draw(ctx);
			//Ptero.score.draw(ctx);
			//timerDisplay.draw(ctx);
		}
		else {
			Ptero.background.draw(ctx);
			playBtn.draw(ctx);
		}
	};

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};
})();
