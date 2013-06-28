
Ptero.scene_gameover = (function(){

	var scoreBtn,playBtn,quitBtn,selectStageBtn;

	var replayScene;
	function getReplayScene() {
		return replayScene;
	}
	function setReplayScene(s) {
		replayScene = s;
	}

	function cleanup() {
		playBtn.disable();
		quitBtn.disable();
		selectStageBtn.disable();
	}

	function init() {
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
				Ptero.fadeToScene(getReplayScene(),0.5);
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
				Ptero.fadeToScene(Ptero.scene_menu,0.5);
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
				var scene = getReplayScene();
				if (scene == Ptero.scene_timeattack) {
					Ptero.fadeToScene(Ptero.scene_pre_timeattack,0.5);
				}
				else if (scene == Ptero.scene_survivor) {
					Ptero.fadeToScene(Ptero.scene_pre_survivor,0.5);
				}
			},
		});
		selectStageBtn.enable();

        Ptero.orb.setNextOrigin(0,-2);
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		Ptero.orb.draw(ctx);
		scoreBtn.draw(ctx);
		playBtn.draw(ctx);
		quitBtn.draw(ctx);
		selectStageBtn.draw(ctx);
	}

	function update(dt) {
		Ptero.orb.update(dt);
	}

	return {
		init:init,
		draw:draw,
		update:update,
		cleanup: cleanup,
		setReplayScene: setReplayScene,
	};
})();
