
Ptero.scene_menu = (function(){

	var song;
	var paths;
	var enemies = [];

	// This controls whether or not the pterodactyls will fly toward you when the menu starts.
	// (This has been said to scare the user into shooting them if they have already played a game,
	// so I will only enable this on startup)
	var isPteroFlying = true;
	function enablePteroFlying(on) {
		isPteroFlying = on;
	}

	var startBtn, optionsBtn;

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
	}

	var fadeOutTime = null;
	var fadeOutLen = 0.5;
	function fadeToGame() {
		fadeOutTime = fadeOutLen;
	}
	function startGame() {
		switchScene(Ptero.scene_play);
		Ptero.audio.getTitleSong().fadeOut(2.0);
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
			e.whenHit = (function(e){ return function() { e.explode(); Ptero.screen.shake(); }; })(e);

			// skip the flying animation if needed
			if (!isPteroFlying) {
				e.path.setTime(e.path.totalTime);
			}

			// add enemy to this scene's enemies
			enemies.push(e);
		}

		enemies[0].afterHit = function() {
			// options
			switchScene(Ptero.scene_options);
		}
		enemies[1].afterHit = function() {
			fadeToGame();
		}
	}

	var time;
	function init() {
		Ptero.setBackground('menu');
		Ptero.background.goToIdle();

		time = 0;

		startBtn = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: 'center',
			text: 'START',
			width: 400,
			height: 200,
			pos: {x:0, y:0, z:0},
		});

		optionsBtn = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: 'center',
			text: 'OPTIONS',
			width: 400,
			height: 100,
			pos: {x:0, y:0, z:0},
		});

		Ptero.input.addTouchHandler(touchHandler);
		Ptero.orb.enableGuide(true);

		createPteros();

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);
	}

	function switchScene(scene) {
		Ptero.setScene(scene);

		// disable ptero flying after first occurence
		enablePteroFlying(false);
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

		if (fadeOutTime != null) {
			fadeOutTime = Math.max(0, fadeOutTime-dt);
		}

		Ptero.orb.update(dt);
		Ptero.bulletpool.deferBullets();
	}

	function draw(ctx) {
		Ptero.assets.keepExplosionsCached(ctx);
		Ptero.deferredSprites.draw(ctx);

		Ptero.orb.draw(ctx);

		var frustum = Ptero.frustum;

		var pos,b;
		var i,len=enemies.length,e;
		var buttons = [
			optionsBtn,
			startBtn,
		];
		var offset = [
			-0.05,
			-0.1,
		];
		for (i=0; i<len; i++) {
			e = enemies[i];
			if (e.path.time >= e.path.totalTime) {
				pos = e.getPosition();
				pos = frustum.projectToNear(pos);
				pos.y += offset[i];
				b = buttons[i];
				b.pos = pos;
				b.draw(ctx);
			}
		}

		if (fadeOutTime != null) {
			var w = Ptero.screen.getWidth();
			var h = Ptero.screen.getHeight();
			var alpha = 1 - fadeOutTime / fadeOutLen;
			ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
			ctx.fillRect(0,0,w,h);
			if (fadeOutTime == 0) {
				fadeOutTime = null;
				startGame();
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
