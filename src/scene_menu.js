
Ptero.scene_menu = (function(){

	var titleSprite;
	var song;

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {
		titleSprite = Ptero.assets.sprites["logo"];

		Ptero.input.addTouchHandler(touchHandler);
		song = Ptero.audio.getTitleSong();
		song.play();
	}

	var touchHandler = {
		start: function(x,y) {
			song.stop();
			Ptero.fadeToScene(Ptero.scene_predefined_paths, 0.25);
		},
		move: function(x,y) {
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
		Ptero.background.update(dt);
	}

	function draw(ctx) {
		Ptero.background.draw(ctx);
		var frustum = Ptero.screen.getFrustum();
		titleSprite.draw(ctx,{x:0,y:frustum.nearTop/3,z:frustum.near});
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
