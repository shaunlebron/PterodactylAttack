
Ptero.scene_title = (function(){

	var buttonList;

	function cleanup() {
	}

	function init() {

		// set title background environment
		Ptero.setBackground('menu');
		Ptero.background.goToIdle();

		buttonList = new Ptero.ButtonList(Ptero.assets.json['btns_loading']);
	}

	function update(dt) {
		// this is only update once, since we're using to play the music and to initially load the pterodactyls for the main menu.
		Ptero.setScene(Ptero.scene_menu);
		var song = Ptero.audio.getTitleSong();
		song.play();
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		buttonList.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
