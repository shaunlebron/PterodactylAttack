
Ptero.scene_credits = (function(){

	var buttonList;

	function cleanup() {
		buttonList.disable();
	}


	function init() {
		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_credits"]);
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
