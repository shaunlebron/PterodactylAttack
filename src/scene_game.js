
Ptero.scene_game = (function() {
	var enemies = [];
	var numEnemies = 20;

	var sortEnemies = function() {
		enemies.sort(function(a,b) {
			return b.path.state.pos.z - a.path.state.pos.z;
		});
	};

	var init = function() {

		Ptero.background.setImage(Ptero.assets.images.desert);

		var i;
		for (i=0; i<numEnemies; i++) {
			enemies.push(new Ptero.Enemy);
		}

		Ptero.orb.init();
        Ptero.orb.setNextOrigin(0,-1);
	};

	var update = function(dt) {
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].update(dt);
		}
		sortEnemies();
		Ptero.orb.update(dt);
	};

	var draw = function(ctx) {
		Ptero.background.draw(ctx);
		var i;
		for (i=0; i<numEnemies; i++) {
			enemies[i].draw(ctx);
		}
		Ptero.orb.draw(ctx);
		var point;
		if (Ptero.input.isTouched()) {
			point = Ptero.input.getPoint();
			ctx.strokeStyle = "rgba(255,0,0,0.5)";
			ctx.lineWidth = 5.0;
			ctx.beginPath();
			ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
			ctx.stroke();
		}
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
