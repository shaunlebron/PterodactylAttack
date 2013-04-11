
Ptero.scene_menu = (function(){

	var titleSprite;

	function init() {
		titleSprite = Ptero.assets.sprites["logo"];

		Ptero.background.setImage(Ptero.assets.images.desert);
		Ptero.input.addTouchHandler(touchHandler);
		var song = Ptero.audio.getThemeSong();
		if (song) {
			song.play();
		}
	}

	var touchHandler = {
		start: function(x,y) {
			Ptero.input.removeTouchHandler(touchHandler);
			Ptero.fadeToScene(Ptero.scene_game, 1.0);
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
		Ptero.background.draw(ctx);
		var frustum = Ptero.screen.getFrustum();
		titleSprite.draw(ctx,{x:0,y:frustum.nearTop/3,z:frustum.near});
	}

	return {
		init: init,
		update: update,
		draw: draw,
	};

})();
