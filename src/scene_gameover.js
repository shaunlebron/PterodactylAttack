
Ptero.scene_gameover = (function(){

	var backplate;
	var backplatePos;

	var replayBtn,quitBtn;

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

		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		replayBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_replay'],
			hudPos: {x:0.5, y:0.5},
			onclick: function() {
				switchScene(Ptero.scene_play);
				//Ptero.audio.playSelect();
			},
		});
		replayBtn.enable();

		quitBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_quit'],
			hudPos: {x:0.5, y:0.7},
			onclick: function() {
				switchScene(Ptero.scene_pre_play);
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
			// TODO: trigger new high score animation
			highScore = currentScore;
			newHighScore = true;
			Ptero.score.commitHighScore();
		}
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		ctx.fillStyle = "rgba(0,0,0,0.7)";
		backplate.fill(ctx, backplatePos);

		Ptero.orb.draw(ctx);
		replayBtn.draw(ctx);
		quitBtn.draw(ctx);
		if (newHighScore) {
			//newHighBtn.draw(ctx);
		}
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
