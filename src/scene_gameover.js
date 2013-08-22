
Ptero.scene_gameover = (function(){

	var backplate;
	var backplatePos;

	var replayBtn,quitBtn;
	var scoreBtn;

	function cleanup() {
		replayBtn.disable();
		quitBtn.disable();
	}

	function switchScene(scene) {
		Ptero.audio.getScoreSong().fadeOut(1.0);
		Ptero.fadeToScene(scene,0.5);
	}

	function init() {
		Ptero.audio.getScoreSong().play();
		Ptero.overlord.stopScript();

		Ptero.score.printState();

		var w = 600;
		var h = 720;
		backplate = {
			"mountain" : Ptero.assets.sprites['backplate_mountain'],
			"ice"      : Ptero.assets.sprites['backplate_ice'],
			"volcano"  : Ptero.assets.sprites['backplate_ice'],
		}[Ptero.background.name];
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		scoreBtn = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: "center",
			text: Ptero.score.getTotal()+"",
			hudPos: {x:0.5, y:0.1},
			width: 400,
			height: 200,
		});

		replayBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts["buttonfont"],
			textAlign: "center",
			text: "REPLAY",
			hudPos: {x:0.5, y:0.75},
			onclick: function() {
				switchScene(Ptero.scene_play);
				//Ptero.audio.playSelect();
			},
		});
		replayBtn.enable();

		quitBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['button_plank'],
			fontSprite: Ptero.assets.fonts["buttonfont"],
			textAlign: "center",
			text: "QUIT",
			hudPos: {x:0.5, y:0.90},
			onclick: function() {
				switchScene(Ptero.scene_menu);
			},
		});
		quitBtn.enable();

		commitHighScore();

        Ptero.orb.setNextOrigin(0,-2);
	}

	var newHighScore;
	function commitHighScore() {
		newHighScore = false;
		var highScore = Ptero.score.getHighScore();
		var currentHigh = highScore || 0;
		var currentScore = Ptero.score.getTotal();
		if (currentScore > currentHigh) {
			newHighScore = true;
			Ptero.score.commitHighScore();
		}
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		backplate.draw(ctx, backplatePos);

		Ptero.orb.draw(ctx);
		replayBtn.draw(ctx);
		quitBtn.draw(ctx);
		scoreBtn.draw(ctx);
	}

	function update(dt) {
		Ptero.orb.update(dt);
		Ptero.overlord.update(dt);
	}

	return {
		init:init,
		draw:draw,
		update:update,
		cleanup: cleanup,
	};
})();
