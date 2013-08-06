
Ptero.scene_gameover = (function(){

	var scoreBtn,playBtn,quitBtn,selectStageBtn,newHighBtn;

	function cleanup() {
		playBtn.disable();
		quitBtn.disable();
		selectStageBtn.disable();
	}

	function switchScene(scene) {
		Ptero.audio.getScoreSong().fadeOut(1.0);
		Ptero.fadeToScene(scene,0.5);
	}

	function init() {
		Ptero.audio.getScoreSong().play();

		newHighBtn = new Ptero.TextButton({
			hudPos: {x:0.5, y:0.33},
			font: "SharkParty",
			fontSize: Ptero.hud.getBaseTextSize()/2,
			textAlign: "center",
			textColor: "#F00",
			text: "High Score!",
			width: 400,
			height: 200,
		});

		scoreBtn = new Ptero.TextButton({
			hudPos: {x:0.5, y:0.25},
			font: "SharkParty",
			fontSize: Ptero.hud.getBaseTextSize()*2,
			textAlign: "center",
			textColor: "#FFF",
			text: ""+Ptero.score.getTotal(),
			width: 400,
			height: 200,
		});

		playBtn = new Ptero.TextButton({
			hudPos: {x:0.25, y:0.5},
			font: "SharkParty",
			textAlign: "center",
			textColor: "#FFF",
			text: "Play again",
			width: 400,
			height: 200,
			onclick: function() {
				switchScene(Ptero.scene_play);
				Ptero.audio.playSelect();
			},
		});
		playBtn.enable();

		quitBtn = new Ptero.TextButton({
			hudPos: {x:0.75, y:0.5},
			font: "SharkParty",
			textAlign: "center",
			textColor: "#FFF",
			text: "Quit to Title",
			width: 400,
			height: 200,
			onclick: function() {
				switchScene(Ptero.scene_menu);
			},
		});
		quitBtn.enable();

		selectStageBtn = new Ptero.TextButton({
			hudPos: {x:0.5, y:0.75},
			font: "SharkParty",
			textAlign: "center",
			textColor: "#FFF",
			text: "Select Stage",
			width: 400,
			height: 200,
			onclick: function() {
				switchScene(Ptero.scene_pre_play);
			},
		});
		selectStageBtn.enable();

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
		Ptero.orb.draw(ctx);
		scoreBtn.draw(ctx);
		playBtn.draw(ctx);
		quitBtn.draw(ctx);
		selectStageBtn.draw(ctx);
		if (newHighScore) {
			newHighBtn.draw(ctx);
		}
	}

	function update(dt) {
		Ptero.orb.update(dt);
	}

	return {
		init:init,
		draw:draw,
		update:update,
		cleanup: cleanup,
	};
})();
