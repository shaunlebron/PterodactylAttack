
Ptero.Crater.scene_crater = (function() {

	function init() {
	};

	function update(dt) {
		Ptero.deferredSprites.clear();
		Ptero.background.update(dt);

		Ptero.Crater.enemy_model_list.update(dt);

		Ptero.deferredSprites.finalize();
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		if (Ptero.Crater.enemy_model_list.isEditing) {
			ctx.fillStyle = "rgba(255,255,255,0.8)";
			ctx.fillRect(0,0,Ptero.screen.getWidth(),Ptero.screen.getHeight());
		}
		Ptero.deferredSprites.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
