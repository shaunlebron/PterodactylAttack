
Ptero.scene_game = (function() {
	var enemies = [];
	var numEnemies = 5;

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
		Ptero.deferredSprites.clear();
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

		timerDisplay = new Ptero.TimerDisplay(20);

		Ptero.background.setImage(Ptero.assets.images.desert, Ptero.assets.images["bg_frosted"]);

		var i;
		enemies.length = 0;
		for (i=0; i<numEnemies; i++) {
			enemies.push(new Ptero.Enemy(Ptero.makeHermiteEnemyPath));
		}

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);

		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	};

	function update(dt) {
		Ptero.background.update(dt);
		Ptero.deferredSprites.clear();
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].update(dt);
			// TODO: only defer if visible
			Ptero.deferredSprites.defer(
				(function(e) {
					return function(ctx){
						e.draw(ctx);
					};
				})(enemies[i]),
				enemies[i].getPosition().z);
		}
		Ptero.orb.update(dt);
		Ptero.bulletpool.deferBullets();
		Ptero.deferredSprites.finalize();
		Ptero.score.update(dt);

		timerDisplay.update(dt);
		if (timerDisplay.isDone()) {
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
			Ptero.score.draw(ctx);
			timerDisplay.draw(ctx);
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
