
Ptero.Crater.scene_crater = (function() {

	function init() {
		Ptero.background.setImage(Ptero.assets.images.desert);
	};

	function update(dt) {
		Ptero.background.update(dt);
		Ptero.deferredSprites.clear();

		var models = Ptero.Crater.enemy_model_list.models;
		var i,len=models.length;
		var e;
		for (i=0; i<len; i++) {
			var e = models[i];
			e.update(dt);
		}

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
