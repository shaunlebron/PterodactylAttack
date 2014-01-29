
Ptero.scene_controlcenter = (function(){

	var buttonList;

	var homeBtn;

	function cleanup() {
		buttonList.disable();
	}

	var displacement = 0;
	var updateDisplacement = (function(){
		var time = 0;
		var step = 1/60;
		return function(dt) {
			time += dt;
			while (time - step >= 0) {
				time -= step;
				displacement *= 0.7;
			}
		};
	})();
	function animateIn() {
		displacement = Ptero.screen.getWindowHeight();
	}

	function init() {

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_controlcenter"]);

		var btns = buttonList.namedButtons;

		var b = btns["home"];
		b.isClickDelay = true;
		b.onclick = function() {
			Ptero.setScene(Ptero.scene_menu);
		};

		buttonList.enable();
	}

	function update(dt) {
		updateDisplacement(dt);
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		
		ctx.save();
		ctx.translate(0, displacement);
		buttonList.draw(ctx);
		ctx.restore();
	}

	return {
		animateIn: animateIn,
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
