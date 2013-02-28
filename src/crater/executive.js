
Ptero.Crater.executive = (function(){

	var lastTime;
	var minFps = 20;
	var isPaused = false;

	function tick(time) {
		try {
			var dt;
			if (lastTime == undefined) {
				dt = 0;
			}
			else {
				dt = Math.min((time-lastTime)/1000, 1/minFps);
			}
			lastTime = time;

			var scene = Ptero.scene;
			if (!isPaused) {
				scene.update(dt);
			}
			var ctx = Ptero.screen.getCtx();
			scene.draw(ctx);
			requestAnimationFrame(tick);
		}
		catch (e) {
			console.error(e.message + "@" + e.sourceURL);
			console.error(e.stack);
		}
	};

	function start() {
		requestAnimationFrame(tick);
	};

	return {
		start: start,
	};
})();
