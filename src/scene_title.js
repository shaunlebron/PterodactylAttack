
Ptero.scene_title = (function(){

	var buttonList;

	function cleanup() {
	}

	function init() {

		// set title background environment
		Ptero.setBackground('menu');
		Ptero.background.goToIdle();

		buttonList = new Ptero.ButtonList(Ptero.assets.json['btns_loading']);
		Ptero.audio.play('theme');
		time = 0;
		vel = 0;
		displacement = 0;
	}

	var time;
	var accel = 8000;
	var displacement;

	function update(dt) {
		time += dt;
		vel += accel*dt;
		displacement += vel*dt;
		if (time > 0.5) {
			Ptero.setScene(Ptero.scene_menu);
		}
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		ctx.save();
		ctx.translate(0,displacement);
		buttonList.draw(ctx);
		ctx.restore();
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
