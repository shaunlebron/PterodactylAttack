
Ptero.scene_gameover = (function(){

	var buttonList;

	var isNewHigh;

	function cleanup() {
		buttonList.disable();
	}

	function switchScene(scene) {
		Ptero.audio.fadeOut('score',1.0);
		Ptero.fadeToScene(scene,0.5);
	}

	function init() {
		Ptero.audio.play('score');
		Ptero.overlord.stopScript();

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_gameover"]);
		buttonList.enable();

		var btns = buttonList.namedButtons;

		btns["score"].text    = Ptero.score.getTotal().toString();
		btns["kills"].text    = Ptero.score.getKills().toString();
		btns["caps"].text     = Ptero.score.getCaptures().toString();
		btns["bounties"].text = Ptero.score.getBounties().toString();
		btns["accuracy"].text = Math.floor(Ptero.score.getAccuracy()*100).toString();

		btns["replay"].onclick = function() {
			switchScene(Ptero.scene_play);
		};

		btns["quit"].onclick = function() {
			switchScene(Ptero.scene_menu);
		};

		isNewHigh = Ptero.score.commitStats();
		btns["highScore"].shouldDraw = isNewHigh.score;

        Ptero.orb.setNextOrigin(0,-2);
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		Ptero.orb.draw(ctx);
		buttonList.draw(ctx);
	}

	var time = 0;
	function update(dt) {
		time += dt;
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
