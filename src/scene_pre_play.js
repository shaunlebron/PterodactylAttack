
Ptero.scene_pre_play = (function(){

	var song;
	var paths;
	var enemies = [];

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
	}

	function createPteros() {
		var wave = Ptero.assets.json["difficulty_paths"];

		var models = wave.models;
		var numModels = models.length;

		enemies.length = 0;

		// iterate each enemy in wave
		for (j=0; j<numModels; j++) {

			// create enemy
			var e = Ptero.Enemy.fromState(models[j]);
			e.path.freezeAtEnd = true;
			e.whenHit = function() { Ptero.screen.shake(); };

			// add enemy to this scene's enemies
			enemies.push(e);
		}

		enemies[0].afterHit = function() {
			// back
			switchScene(Ptero.scene_menu);
		}
	}

	var time;
	function init() {
		//Ptero.background.enableDesat(true);

		time = 0;

		Ptero.input.addTouchHandler(touchHandler);

		createPteros();

		Ptero.orb.init();
		Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);
		resetPanes();

		resetHighScoreText();
		makeFramePositions();
	}

	var framePositions;
	function makeFramePositions() {
		var frustum = Ptero.screen.getFrustum();
		var x = frustum.nearRight/3*2;
		framePositions = [
			{
				x: -x,
				y: 0,
				z: frustum.near,
			},
			{
				x: 0,
				y: 0,
				z: frustum.near,
			},
			{
				x: x,
				y: 0,
				z: frustum.near,
			},
		];
	}

	var highScore;
	function resetHighScoreText() {
		highScore = null;
	}
	function drawHighScoreText(ctx) {
		if (highScore != null) {
			var size = Ptero.hud.getTextSize('menu_option');
			ctx.font = size +"px SharkParty";
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.textBaseline = "bottom";
			ctx.textAlign = "right";
			var pad = Ptero.hud.getBorderPad();
			var y = topPaneY;
			var x = Ptero.screen.getWidth() - pad;
			var p = Ptero.screen.screenToSpace({ x: x, y: y });
			p = Ptero.screen.spaceToScreen(p); // to get it shaking
			ctx.fillText("high: " + highScore, p.x, p.y);
		}
	}

	var topPaneY;
	var botPaneY;
	var topPaneY2;
	var botPaneY2;
	function resetPanes() {
		var h = Ptero.screen.getHeight();
		topPaneY = 0;
		topPaneY2 = h/10*3;
		botPaneY = h;
		botPaneY2 = h/10*7;
	}
	function updatePanes() {
		topPaneY += (topPaneY2 - topPaneY) * 0.1;
		botPaneY += (botPaneY2 - botPaneY) * 0.1;
	}
	function drawPanes(ctx) {
		var w = Ptero.screen.getWidth();
		var h = Ptero.screen.getHeight();

		ctx.fillStyle = "rgba(255,255,255,0.5)";

		ctx.fillRect(0,0,w,topPaneY);
		ctx.fillRect(0,botPaneY,w,h);
	}

	function switchScene(scene) {
		Ptero.fadeToScene(scene, 0.25);
		Ptero.audio.getTitleSong().fadeOut(2.0);
	}

	var touchHandler = {
		start: function(x,y) {
			var i;
			var names = ["mountain", "ice", "volcano"];
			var name;
			var sprite;
			var pos;
			for (i=0; i<3; i++) {
				name = names[i];
				sprite = Ptero.assets.sprites["frame_"+name];
				pos = framePositions[i];
				if (sprite.billboard.isInsideScreenRect(x,y,pos)) {
					Ptero.scene_play.setStage(name);
					Ptero.setScene(Ptero.scene_play);
					break;
				}
			}
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
					(function(enemy) {
						return function(ctx){
							enemy.draw(ctx);
						};
					})(enemies[i]),
					pos.z);
			}
		}

		Ptero.orb.update(dt);
		Ptero.bulletpool.deferBullets();
		updatePanes();
	}

	function draw(ctx) {
		Ptero.assets.keepExplosionsCached(ctx);
		Ptero.deferredSprites.draw(ctx);

		drawPanes(ctx);
		Ptero.orb.draw(ctx);

		drawHighScoreText(ctx);

		var size = Ptero.hud.getTextSize('menu_title');
		ctx.font = size + "px SharkParty";
		ctx.fillStyle = "#000";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var frustum = Ptero.screen.getFrustum();
		var p = Ptero.screen.spaceToScreen({x:0, y:frustum.nearTop/4*3, z:frustum.near});
		var x = p.x;
		var y = p.y;
		ctx.fillText("Select stage", x,y);

		if (time >= 1) {
			var size = Ptero.hud.getTextSize('menu_option');
			ctx.font = size + "px SharkParty";
			ctx.fillStyle = "#FFF";
			ctx.textBaseline = "middle";
			ctx.textAlign = "center";

			var titles = [
				"back",
			];

			var i;
			for (i=0; i<enemies.length; i++) {
				var p = Ptero.screen.spaceToScreen(enemies[i].getPosition());
				var x = p.x;
				var y = p.y;
				var title = titles[i];
				ctx.fillText(titles[i],x,y);
			}
		}

		for (i=0; i<3; i++) {
			var pos = framePositions[i];
			var sprite;
			if (i==0) {
				sprite = Ptero.assets.sprites["frame_mountain"];
			}
			else if (i==1) {
				sprite = Ptero.assets.sprites["frame_ice"];
			}
			else if (i==2) {
				sprite = Ptero.assets.sprites["frame_volcano"];
			}

			sprite.draw(ctx, pos);
		}
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup: cleanup,
	};

})();
