
Ptero.Fourier.scene_fourier = (function() {

	function cleanup() {
		Ptero.orb.disableTouch();
		Ptero.bulletpool.clear();
		Ptero.deferredSprites.clear();
	}

	function init() {

		Ptero.player = new Ptero.Player();

		Ptero.orb.init();
		//Ptero.orb.setTargets(enemies);
        Ptero.orb.setNextOrigin(0,-1);

		Ptero.setBackground('mountain');
		Ptero.background.goToIdle();
	};

	function update(dt) {
		Ptero.Fourier.wave_list.update(dt);
		Ptero.orb.update(dt);
		Ptero.bulletpool.deferBullets();
	};

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		Ptero.orb.draw(ctx);
		var point;
		if (Ptero.input.isTouched()) {
			point = Ptero.input.getPoint();
			ctx.fillStyle = "rgba(255,255,255,0.2)";
			ctx.beginPath();
			ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
			ctx.fill();
		}
	};

	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
