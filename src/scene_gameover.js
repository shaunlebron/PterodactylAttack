
Ptero.scene_gameover = (function(){

	var buttonList;

	var isNewHigh;

	function cleanup() {
		buttonList.disable();
	}

	var isExiting;
	function init() {
		Ptero.audio.play('score');
		Ptero.overlord.stopScript();
		isExiting = false;

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_gameover"]);

		var btns = buttonList.namedButtons;

		btns["score"].text    = Ptero.score.getTotal().toString();
		btns["waves"].text    = Ptero.score.getWaves().toString();
		btns["kills"].text    = Ptero.score.getKills().toString();
		btns["caps"].text     = Ptero.score.getCaptures().toString();
		btns["bounties"].text = Ptero.score.getBounties().toString();
		btns["accuracy"].text = Math.floor(Ptero.score.getAccuracy()*100).toString();

		btns["replay"].onclick = function() {
			isExiting = true;
			cleanup();
			Ptero.audio.fadeOut('score',1.0);
			Ptero.background.exit();
			Ptero.background.onExitDone = function() {
				setTimeout(function(){
					Ptero.background.stopSounds();
					Ptero.setScene(Ptero.scene_play);
				}, 1000);
			};
		};

		btns["quit"].onclick = function() {
			Ptero.background.stopSounds();
			Ptero.setScene(Ptero.scene_menu);
			Ptero.audio.stop('score');
			Ptero.audio.play('theme');
		};

		// enable controls after one second to prevent inadvertent selection if swipe actions spill over from the game
		setTimeout(function() {
			btns["replay"].enable();
			btns["quit"].enable();
		}, 1000);

		isNewHigh = Ptero.score.commitStats();
		if (!isNewHigh.score) {
			btns["highScore"].text = "game over";
		}
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());
		if (!isExiting) {

			buttonList.draw(ctx);
		}
	}

	var time = 0;
	function update(dt) {
		time += dt;
		Ptero.overlord.update(dt);
	}

	return {
		init:init,
		draw:draw,
		update:update,
		cleanup: cleanup,
	};
})();
