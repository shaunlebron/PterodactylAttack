Ptero.setScene = function(scene) {
	Ptero.scene = scene;
	scene.init();
};

Ptero.executive = (function(){

	var lastTime;
	var minFps = 20;
	var t = 0;

	function tick(time) {
		try {
			var dt = (lastTime == undefined) ? 0 : Math.min((time-lastTime)/1000, 1/minFps);
			lastTime = time;

			var scene = Ptero.scene;
			t += dt;
			scene.setTime(t);
			scene.draw();
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
