
Ptero.Pinboard.scene_pinboard = (function(){

	function init() {
		Ptero.setBackground('menu');

		var s = Ptero.screen;
		s.setWindowScale(s.getCanvasHeight() / (s.getWindowHeight()*1.5));
		s.centerWindowAtPixel(s.getCanvasWidth()/2, s.getCanvasHeight()/2);
	}
	
	function cleanup() {
	}

	function draw(ctx) {
		ctx.save();
		Ptero.screen.transformToWindow();
		ctx.save();
		Ptero.screen.clipWindow();
		Ptero.deferredSprites.draw(ctx);
		ctx.restore();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 10;
		ctx.strokeRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());

		// TODO: draw images in depth order here

		ctx.restore();
	}

	function update(dt) {
		Ptero.background.update(dt);
	}

	return {
		init: init,
		cleanup: cleanup,
		draw: draw,
		update: update,
	};
})();
