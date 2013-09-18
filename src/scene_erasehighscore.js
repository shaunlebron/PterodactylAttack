
Ptero.scene_erasehighscore = (function(){

	var buttonList;

	function cleanup() {
		buttonList.disable();
	}

	function init() {

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_erasehighscore"]);
		buttonList.enable();

		var btns = buttonList.namedButtons;

		btns["erase"].onclick = function() {
			Ptero.settings.clearHighScores();
			Ptero.setScene(Ptero.scene_highscore);
		};

		btns["cancel"].onclick = function() {
			Ptero.setScene(Ptero.scene_highscore);
		};

		btns["wrench"].onclick = function() {
			Ptero.setScene(Ptero.scene_options);
		};

		btns["strong"].onclick = function() {
			//Ptero.setScene(Ptero.scene_highscore);
		};

		btns["scroll"].onclick = function() {
			Ptero.setScene(Ptero.scene_credits);
		};

		var b = btns["back"];
		b.isClickDelay = true;
		b.onclick = function() {
			Ptero.setScene(Ptero.scene_menu);
		};
	}

	function update(dt) {
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		buttonList.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
