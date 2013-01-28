
Ptero.Crater.executive = (function(){

	var lastTime;
	var minFps = 20;
	var isPaused = false;

	function tick(time) {
		try {
			var dt = Math.min((time-lastTime)/1000, 1/minFps);
			lastTime = time;

			var scene = Ptero.scene;
			if (!isPaused) {
				scene.update(dt);
			}
			var ctx = Ptero.screen.getCtx();
			ctx.save();
			ctx.beginPath();
			ctx.rect(0,0,Ptero.screen.getWidth(),Ptero.screen.getHeight());
			ctx.clip();
			scene.draw(ctx);
			ctx.restore();
			requestAnimationFrame(tick);
		}
		catch (e) {
			console.error(e.message + "@" + e.sourceURL);
			console.error(e.stack);
		}
	};

	function start() {
		lastTime = (new Date).getTime();
		requestAnimationFrame(tick);
	};

	return {
		start: start,
	};
})();
