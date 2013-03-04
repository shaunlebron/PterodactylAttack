
Ptero.Crater.scene_crater = (function() {

	function init() {
		Ptero.background.setImage(Ptero.assets.images.desert);
	};

	function update(dt) {
		Ptero.Crater.enemy_model.update(dt);
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		Ptero.Crater.enemy_model.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
