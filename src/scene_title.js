
Ptero.scene_title = (function(){

	var buttonList;
	var isAnimating;

	var bgSprite, bgPos;

	function cleanup() {
	}

	function init() {

		bgSprite = Ptero.assets.sprites['bg_menu'];
		var frustum = Ptero.frustum;
		bgPos = {
			x:0,
			y:0,
			z: frustum.near,
		};

		buttonList = new Ptero.ButtonList(Ptero.assets.json['btns_loading']);
		time = 0;
		vel = 0;
		displacement = 0;
		isAnimating = false;
	}

	function animateOut() {
		isAnimating = true;
		Ptero.audio.play('theme');
	}

	var time;
	var accel = 8000;
	var displacement;

	function update(dt) {
		if (isAnimating) {
			time += dt;
			vel += accel*dt;
			displacement += vel*dt;
			if (time > 0.5) {
				Ptero.setScene(Ptero.scene_menu);
			}
		}
	}

	function draw(ctx) {
		bgSprite.draw(ctx, bgPos);
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
		animateOut: animateOut,
	};

})();
