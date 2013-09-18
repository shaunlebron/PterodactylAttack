
Ptero.scene_highscore = (function(){

	var buttonList;

	function cleanup() {
		buttonList.disable();
	}

	function init() {

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_highscore"]);

		var btns = buttonList.namedButtons;

		btns["score"].text    = Ptero.settings.get("high_score").toString();
		btns["waves"].text    = Ptero.settings.get("high_waves").toString();
		btns["kills"].text    = Ptero.settings.get("high_kills").toString();
		btns["caps"].text     = Ptero.settings.get("high_captures").toString();
		btns["bounties"].text = Ptero.settings.get("high_bounties").toString();

		btns["erase"].onclick = function() {
			Ptero.setScene(Ptero.scene_erasehighscore);
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

		buttonList.enable();
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
