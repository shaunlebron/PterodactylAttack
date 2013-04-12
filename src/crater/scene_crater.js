
Ptero.Crater.scene_crater = (function() {

	function init() {
		Ptero.background.setImage(Ptero.assets.images.desert);
	};

	function update(dt) {
		Ptero.background.update(dt);
		Ptero.deferredSprites.clear();
		Ptero.Crater.enemy_model.update(dt);
		Ptero.deferredSprites.finalize();
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		Ptero.Crater.enemy_model.draw(ctx);
		Ptero.deferredSprites.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
