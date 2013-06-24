
Ptero.scene_menu = (function(){

	var song;
	var paths;
	var enemies = [];

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
	}

	function createPteros() {
		var wave = Ptero.assets.json["mainmenu_paths"];

		var models = wave.models;
		var numModels = models.length;

		enemies.length = 0;

		// iterate each enemy in wave
		for (j=0; j<numModels; j++) {

			// create enemy
			var e = Ptero.Enemy.fromState(models[j]);
			e.path.freezeAtEnd = true;

			// add enemy to this scene's enemies
			enemies.push(e);
		}

		enemies[0].afterHit = function() {
			// start survivor mode
		}
		enemies[1].afterHit = function() {
			// start time attack mode
			switchScene(Ptero.scene_timeattack);
			var song = Ptero.audio.getTitleSong();
			song.fadeOut(1);
		}
		enemies[2].afterHit = function() {
			// exit
			switchScene(Ptero.scene_title);
		}
		enemies[3].afterHit = function() {
			// options
		}
	}

	var time;
	function init() {
		time = 0;

		Ptero.input.addTouchHandler(touchHandler);
		Ptero.orb.allowTapToSelect(false);

		createPteros();

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);
	}

	function switchScene(scene) {
		Ptero.fadeToScene(scene, 0.25);
	}

	var touchHandler = {
		start: function(x,y) {
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
		time += dt;

		var i,numEnemies = enemies.length;
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
	}

	function draw(ctx) {
		Ptero.assets.keepExplosionsCached(ctx);
		Ptero.deferredSprites.draw(ctx);

		Ptero.orb.draw(ctx);

		if (time >= 1) {
			ctx.font = "30px SharkParty";
			ctx.fillStyle = "#FFF";
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";

			var titles = [
				"Survivor",
				"Time Attack",
				"Exit",
				"Options",
			];

			var i;
			for (i=0; i<4; i++) {
				var p = Ptero.screen.spaceToScreen(enemies[i].getPosition());
				var x = p.x;
				var y = p.y;
				var title = titles[i];
				ctx.fillText(titles[i],x,y);
			}
		}
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
