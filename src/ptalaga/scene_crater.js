
Ptero.Ptalaga.scene_crater = (function() {

	function init() {
		Ptero.orb.init();
		Ptero.orb.disableTouch();
		Ptero.orb.setOrigin(0,-1);
	};

	function update(dt) {
		Ptero.deferredSprites.clear();
		Ptero.background.update(dt);

		Ptero.Ptalaga.enemy_model_list.update(dt);

		Ptero.deferredSprites.finalize();
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		if (!Ptero.Ptalaga.enemy_model_list.isPreview) {
			Ptero.background.setWash(true);
		}
		Ptero.deferredSprites.draw(ctx);
		Ptero.background.setWash(false);
		Ptero.orb.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
