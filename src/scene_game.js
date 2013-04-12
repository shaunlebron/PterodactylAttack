
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

	function init() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
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
	};

	function keepExplosionsCached(ctx) {
		// This seems to prevents the sporadic drawing of explosions from creating hiccups in the framerate.
		// This method works by trying to keep the textures loaded in whatever internal cache the Chrome browser uses for drawing textures.
		// We try to draw it in the smallest surface area possible.
		var s = 10;
		ctx.drawImage(Ptero.assets.images["boom1"],0,0,s,s);
		ctx.drawImage(Ptero.assets.images["boom2"],0,0,s,s);
		ctx.drawImage(Ptero.assets.images["boom3"],0,0,s,s);
	}

	var pauseAlpha = 0;
	var pauseTargetAlpha = 0;
	function drawPause(ctx) {
		if (Ptero.executive.isPaused()) {
			pauseTargetAlpha = 1;
		}
		else {
			pauseTargetAlpha = 0;
		}
		var img = Ptero.assets.images["pause"];
		var x = Ptero.screen.getWidth() - img.width;
		var y = Ptero.screen.getHeight() - img.height;
		pauseAlpha += (pauseTargetAlpha - pauseAlpha) * 0.3;
		if (pauseAlpha > 0.001) {
			ctx.globalAlpha = pauseAlpha;
			ctx.drawImage(img, x,y);
			ctx.globalAlpha = 1;
		}
	}

	function draw(ctx) {
		keepExplosionsCached(ctx);
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
		drawPause(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
