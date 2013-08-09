
Ptero.scene_title = (function(){

	var titleSprite;
	var song;
	var titleMover;
	var startY, endY;
	var titlePos;
	var paths;
	var enemies = [];

	var movingOut;

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {

		movingOut = false;

		// set title background environment
		Ptero.setBackground('mountain');
		Ptero.background.goToIdle();

		titleSprite = Ptero.assets.sprites["logo"];

		var frustum = Ptero.screen.getFrustum();
		startY = frustum.nearTop*2;
		endY = frustum.nearTop/3;
		var midY = frustum.nearTop/4;

		titlePos = {
			x: 0,
			y: endY,
			z: frustum.near,
		};
		titleMover = {
			t:0,
			interp: Ptero.makeHermiteInterp([endY, midY, startY], [0, 0.2, 0.2]),
			update: function(dt) {
				this.t += dt;
				var y = this.interp(this.t);
				if (y != null) {
					titlePos.y = y;
				}
				else {
					Ptero.setScene(Ptero.scene_menu);
				}
			},
		};

		Ptero.input.addTouchHandler(touchHandler);
		song = Ptero.audio.getTitleSong();
		song.play();
	}

	var touchHandler = {
		start: function(x,y) {
			movingOut = true;
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
		if (movingOut) {
			titleMover.update(dt);
		}
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
