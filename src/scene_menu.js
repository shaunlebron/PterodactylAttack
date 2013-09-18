
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
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
	}

	var fadeOutTime;
	var fadeOutLen = 0.5;
	function fadeToGame() {
		fadeOutTime = fadeOutLen;
	}
	function startGame() {
		switchScene(Ptero.scene_play);
		Ptero.audio.fadeOut('theme', fadeOutLen);
	}

	function createPteros() {
		var wave = Ptero.assets.json["mainmenu_paths"];

		var models = wave.models;
		var numModels = models.length;

		enemies.length = 0;

		var optionSelected = false;

		// iterate each enemy in wave
		for (j=0; j<numModels; j++) {

			// event
			var action;
			if (j == 0) {
				action = function() {
					if (!optionSelected) {
						optionSelected = true;
						Ptero.scene_options.animateIn();
						switchScene(Ptero.scene_options);
					}
				};
			}
			else if (j == 1) {
				action = function() {
					if (!optionSelected) {
						optionSelected = true;
						fadeToGame();
					}
				};
			}

			// create enemy
			var e = Ptero.Enemy.fromState(models[j]);
			if (j == 0) {
				e.setType([
					"baby_ice_yellow",
					"baby_ice_purple",
				][Math.floor(Math.random()*2)]);
			}
			else if (j == 1) {
				e.setType([
					"adult_ice_red",
					"adult_ice_green",
				][Math.floor(Math.random()*2)]);
			}
			e.path.freezeAtEnd = true;
			e.whenHit = (function(e,action){
				return function() {
					e.explode();
					Ptero.screen.shake();
					setTimeout(action, 500);
				};
			})(e,action);

			// skip the flying animation if needed
			if (!isPteroFlying) {
				e.path.setTime(e.path.totalTime);
			}

			// add enemy to this scene's enemies
			enemies.push(e);
		}
	}

	var orbInitialized;
	function initOrb() {
		Ptero.orb.init();
		Ptero.orb.enableGuide(true);
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);
	}

	function init() {
		Ptero.setBackground('menu');
		Ptero.background.goToIdle();

		fadeOutTime = null;

		startBtn = new Ptero.Button({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: 'center',
			text: 'START',
			billboard: new Ptero.Billboard(200,100,400,200),
			pos: {x:0, y:0, z:0},
		});

		optionsBtn = new Ptero.Button({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: 'center',
			text: 'OPTIONS',
			billboard: new Ptero.Billboard(200,50,400,100),
			pos: {x:0, y:0, z:0},
		});


		createPteros();
		orbInitialized = false;
	}

	function switchScene(scene) {
		Ptero.setScene(scene);

		// disable ptero flying after first occurence
		enablePteroFlying(false);
	}

	function update(dt) {

		// update enemies
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

		// init orb when enemies are in places
		var e = enemies[0];
		if (e.path.time >= e.path.totalTime) {
			if (!orbInitialized) {
				orbInitialized = true;
				initOrb();
			}
		}
		if (orbInitialized) {
			Ptero.orb.update(dt);
		}

		if (fadeOutTime != null) {
			fadeOutTime = Math.max(0, fadeOutTime-dt);
		}


		Ptero.bulletpool.deferBullets();
	}

	function draw(ctx) {
		Ptero.assets.keepExplosionsCached(ctx);
		Ptero.deferredSprites.draw(ctx);

		if (orbInitialized) {
			Ptero.orb.draw(ctx);
		}

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
			var w = Ptero.screen.getWindowWidth();
			var h = Ptero.screen.getWindowHeight();
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
