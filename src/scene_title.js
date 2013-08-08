
Ptero.scene_title = (function(){

	var titleSprite;
	var song;
	var titleMover;
	var startY, endY;
	var titlePos;
	var paths;
	var enemies = [];

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {

		// set title background environment
		Ptero.setBackground('mountain');

		titleSprite = Ptero.assets.sprites["logo"];

		var frustum = Ptero.screen.getFrustum();
		startY = frustum.nearTop*2;
		endY = frustum.nearTop/3;
		var midY = frustum.nearTop/4;

		titlePos = {
			x: 0,
			z: frustum.near,
		};
		titleMover = {
			t:0,
			interp: Ptero.makeHermiteInterp([startY, midY, endY], [1.0, 0.3, 0.5]),
			update: function(dt) {
				this.t += dt;
				var y = this.interp(this.t);
				if (y != null) {
					titlePos.y = y;
				}
			},
		};
		titleMover.update(0);

		//Ptero.input.addTouchHandler(touchHandler);
		song = Ptero.audio.getTitleSong();
		song.play();
	}

	var touchHandler = {
		start: function(x,y) {
			Ptero.fadeToScene(Ptero.scene_menu, 0.25);
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
		titleMover.update(dt);
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		titleSprite.draw(ctx,titlePos);

	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
