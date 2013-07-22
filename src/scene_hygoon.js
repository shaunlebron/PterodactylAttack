
Ptero.scene_hygoon = (function(){

	var fgSprite;
	var bgSprite;

	var fgPos, bgPos;


	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {
		Ptero.setBackground(null);

		fgSprite = Ptero.assets.sprites["splash_fg"];
		bgSprite = Ptero.assets.sprites["splash_bg"];

		var frustum = Ptero.screen.getFrustum();

		fgPos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		bgPos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};
		Ptero.input.addTouchHandler(touchHandler);
	}

	var touchHandler = {
		start: function(x,y) {
			Ptero.setScene(Ptero.scene_title);
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
	}

	function draw(ctx) {
		bgSprite.draw(ctx,bgPos);
		fgSprite.draw(ctx,fgPos);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
