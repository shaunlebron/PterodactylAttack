
Ptero.scene_menu = (function(){

	var titleImg;
	var titleBoard;
	function init() {
		titleImg = Ptero.assets.images['logo'];
		titleBoard = Ptero.assets.billboards['logo'];
		Ptero.background.setImage(Ptero.assets.images.desert);
		Ptero.input.addTouchHandler(touchHandler);
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
		Ptero.painter.drawImage(ctx,titleImg,{x:0,y:0,z:Ptero.screen.getFrustum().near},titleBoard);
	}

	return {
		init: init,
		update: update,
		draw: draw,
	};

})();
