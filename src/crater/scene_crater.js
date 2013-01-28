
Ptero.Crater.scene_crater = (function() {

	var enemy;

	function init() {
		Ptero.background.setImage(Ptero.assets.images.desert);
		enemy = new Ptero.Crater.Enemy;
		enemy.path = new Ptero.Path(
			[new Ptero.Vector(0,0,Ptero.screen.getFrustum().near)],
			[1],
			true);
	};

	function update(dt) {
		enemy.update(dt);
	};

	function draw(ctx) {
		Ptero.background.draw(ctx);
		enemy.draw(ctx);
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
