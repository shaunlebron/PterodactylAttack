
Ptero.Ptalaga.scene_crater = (function() {

	function init() {
		Ptero.orb.init();
		Ptero.orb.disableTouch();
		Ptero.orb.setOrigin(0,-1);
		Ptero.setBackground('mountain');
		Ptero.background.goToIdle();
	};

	function update(dt) {
		Ptero.Ptalaga.enemy_model_list.update(dt);
		if (!Ptero.Ptalaga.enemy_model_list.isPreview) {
			Ptero.background.setShade('white');
		}
		else {
			Ptero.background.setShade(null);
		}
		Ptero.background.update(dt);
	};

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		Ptero.orb.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
