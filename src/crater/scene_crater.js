
Ptero.Crater.scene_crater = (function() {

	var enemy;
	var enemy_points = [];

	function init() {
		Ptero.background.setImage(Ptero.assets.images.desert);

		var z = Ptero.screen.getFrustum().near;
		enemy_points[0] = { x:0,y:0,z:z };

		function makePointPath() {
			function interp(t) {
				return enemy_points[0];
			}
			interp.totalTime = Infinity;
			return new Ptero.Path(interp);
		}
		enemy = new Ptero.Enemy(makePointPath);

		Ptero.Crater.enemy = enemy;
		Ptero.Crater.enemy_points = enemy_points;
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
