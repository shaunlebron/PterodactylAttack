
Ptero.scene_title = (function(){

	var buttonList;
	var isAnimating;
	var isCached;

	var mode;

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

		mode = 'waiting';
	}

	function animateOut() {
		Ptero.setBackground('menu');
		mode = 'caching';
	}

	var time;
	var accel = 8000;
	var displacement;

	function update(dt) {
		if (mode == 'waiting') {
		}
		else if (mode == 'caching') {
			Ptero.background.update(dt);
		}
		else if (mode == 'animating') {
			Ptero.background.update(dt);
			time += dt;
			vel += accel*dt;
			displacement += vel*dt;
			if (time > 0.5) {
				Ptero.setScene(Ptero.scene_menu);
			}
		}
	}

	function draw(ctx) {
		if (mode == 'waiting') {
			bgSprite.draw(ctx, bgPos);
		}
		else if (mode == 'caching') {
			Ptero.deferredSprites.draw(ctx);
			Ptero.audio.play('theme');
			mode = 'animating';
		}
		else if (mode == 'animating') {
			Ptero.deferredSprites.draw(ctx);
		}
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
