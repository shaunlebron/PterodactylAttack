
Ptero.Baklava.scene_parallax = (function() {

	function init() {
	};

	function update(dt) {
		Ptero.background.update(dt);
		Ptero.Baklava.model.update(dt);
	};

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
