
Ptero.Baklava.scene_parallax = (function() {

	function init() {
		//Ptero.Baklava.enemy = new 
	};

	function update(dt) {
		Ptero.deferredSprites.clear();
		Ptero.background.update(dt);
		Ptero.Baklava.model.update(dt);
		Ptero.deferredSprites.finalize();
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		Ptero.deferredSprites.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
