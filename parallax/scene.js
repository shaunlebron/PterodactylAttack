
Ptero.scene = (function(){

	var enemies = [];
	var maxTime = 0;

	function createPteros() {
		var wave = Ptero.assets.json["ptero_paths"];

		var models = wave.models;
		var numModels = models.length;

		enemies.length = 0;

		// iterate each enemy in wave
		var j;
		for (j=0; j<numModels; j++) {
			var e = Ptero.Enemy.fromState(models[j]);
			enemies.push(e);
			maxTime = Math.max(maxTime, e.path.totalTime);
		}
	}

	function init() {
		createPteros();
	}

	function setFracTime(k) {
		setTime(k * maxTime);
	}

	function setTime(t) {
		Ptero.deferredSprites.clear();

		// update enemies
		var i,numEnemies = enemies.length;
		for (i=0; i<numEnemies; i++) {
			enemies[i].setTime(t);
			var pos = enemies[i].getPosition();
			if (pos) {
				Ptero.deferredSprites.defer(
					(function(e) {
						return function(ctx){
							e.draw(ctx);
						};
					})(enemies[i]),
					pos.z);
			}
		}

		Ptero.deferredSprites.finalize();
	}

	function draw() {
		var ctx = Ptero.screen.getCtx();
		ctx.save();
		Ptero.screen.transformToWindow();

		Ptero.assets.sprites["bg"].draw(ctx, { x: 0, y: 0, z: Ptero.frustum.near });
		Ptero.deferredSprites.draw(ctx);

		ctx.restore();

		// color in the margins to prevent artifacts
		ctx.fillStyle = "#EEE";
		var h = Ptero.screen.getCanvasHeight();
		var w = Ptero.screen.getCanvasWidth();
		var topY = Ptero.screen.getWindowPos().y;
		var botY = topY + Ptero.screen.getWindowWidth() /16*9*Ptero.screen.getWindowScale();
		if (topY > 0) {
			ctx.fillRect(0,0, w, topY);
		}
		if (botY < h) {
			ctx.fillRect(0, botY, w, h-botY);
		}
	}

	return {
		init: init,
		setTime: setTime,
		setFracTime: setFracTime,
		draw: draw,
	};
})();
