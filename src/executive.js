Ptero.setScene = function(scene) {
	Ptero.scene = scene;
	scene.init();
};

Ptero.executive = (function(){

	var lastTime;
	var minFps = 20;

    var fps;
    var updateFps = (function(){
        var length = 60;
        var times = [];
        var startIndex = 0;
        var endIndex = -1;
        var filled = false;

        return function(now) {
            if (filled) {
                startIndex = (startIndex+1) % length;
            }
            endIndex = (endIndex+1) % length;
            if (endIndex == length-1) {
                filled = true;
            }

            times[endIndex] = now;

            var seconds = (now - times[startIndex]) / 1000;
            var frames = endIndex - startIndex;
            if (frames < 0) {
                frames += length;
            }
            fps = frames / seconds;
        };
    })();
	var drawFps = function(ctx) {
		ctx.font = "30px Arial";
		ctx.fillStyle = "#FFF";
		var pad = 5;
		var x = pad;
		var y = Ptero.screen.getHeight() - pad;
		ctx.fillText(Math.floor(fps)+" fps", x, y);
	};

	var tick = function(time) {
		updateFps(time);

		var dt = Math.min((time-lastTime)/1000, 1/minFps);
		lastTime = time;

		var scene = Ptero.scene;
		if (!isPaused) {
			scene.update(dt);
		}
		var ctx = Ptero.screen.getCtx();
		scene.draw(ctx);
		drawFps(ctx);
		requestAnimationFrame(tick);
	};

	var isPaused = false;
	var pause = function() {
		isPaused = true;
	};
	var resume = function() {
		isPaused = false;
	};

	var start = function() {
		lastTime = (new Date).getTime();
		requestAnimationFrame(tick);
	};

	return {
		start: start,
		pause: pause,
		resume: resume,
	};
})();
