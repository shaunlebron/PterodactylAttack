
Ptero.scene_hygoon = (function(){

	var fgSprite;
	var bgSprite;

	var fgPos, bgPos;
	var fgOpacityInterp, bgOpacityInterp;


	function cleanup() {
	}

	var time;
	function init() {
		Ptero.setBackground(null);

		time = 0;

		fgSprite = Ptero.assets.sprites["splash_fg"];
		bgSprite = Ptero.assets.sprites["splash_bg"];

		function timesToDeltas(times) {
			var dt = [0];
			var i,len=times.length;
			for (i=1; i<len; i++) {
				dt.push(times[i]-times[i-1]);
			}
			return dt;
		}

		fgOpacityInterp = Ptero.makeInterp('linear', [0,0,1,1,0,0], timesToDeltas([0, 0.2, 1.5, 3.55, 4.6, 5]));
		bgOpacityInterp = Ptero.makeInterp('linear', [0,0,0.5,0,0], timesToDeltas([0, 0.8, 3, 4.2, 5]));

		var frustum = Ptero.screen.getFrustum();
		fgPos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};
		bgPos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};
	}

	function update(dt) {
		time += dt;
		if (time >= 5) {
			Ptero.setScene(Ptero.scene_title);
		}
	}

	function draw(ctx) {
		var w = Ptero.screen.getWidth();
		var h = Ptero.screen.getHeight();

		ctx.fillStyle = '#000';
		ctx.fillRect(0,0,w,h);

		ctx.globalAlpha = bgOpacityInterp(time);
		bgSprite.draw(ctx,bgPos);

		ctx.globalAlpha = fgOpacityInterp(time);
		fgSprite.draw(ctx,fgPos);

		ctx.globalAlpha = 1.0;
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
