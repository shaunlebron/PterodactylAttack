
Ptero.Pinboard.scene_pinboard = (function(){

	var isZoomPanKey;
	var touchHandler = (function(){
		var dx,dy;
		var isZoomPan;
		
		return {
			coord: "canvas",
			start: function(cx,cy) {
				isZoomPan = isZoomPanKey;
				if (isZoomPan) {
					var c = Ptero.screen.getWindowPos();
					dx = cx - c.x;
					dy = cy - c.y;
				}
			},
			move: function(cx,cy) {
				if (isZoomPan) {
					Ptero.screen.setWindowPos(cx-dx, cy-dy);
				}
			},
			end: function(cx,cy) {
				isZoomPan = false;
			},
			cancel: function(cx,cy) {
				isZoomPan = false;
			},
			scroll: function(cx,cy,delta,deltaX,deltaY) {
				if (isZoomPanKey) {
					// from: http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
					var scaleFactor = Math.pow(1 + Math.abs(deltaY)/4 , deltaY > 0 ? 1 : -1);

					var scale = Ptero.screen.getWindowScale() * scaleFactor;
					var maxScale = Ptero.screen.getWindowFitScale();
					var minScale = maxScale / 8;
					scale = Math.max(minScale, Math.min(maxScale, scale));

					Ptero.screen.zoomWindow(scale, cx, cy);
				}
			},
		};
	})();

	function init() {
		Ptero.setBackground('menu');
		var s = Ptero.screen;
		s.setWindowScale(s.getCanvasHeight() / (s.getWindowHeight()*1.5));
		s.centerWindowAtPixel(s.getCanvasWidth()/2, s.getCanvasHeight()/2);

		Ptero.input.addTouchHandler(touchHandler);
		window.addEventListener("keydown", function(e) {
			if (e.keyCode == 18) {
				isZoomPanKey = true;
			}
		});
		window.addEventListener("keyup", function(e) {
			if (e.keyCode == 18) {
				isZoomPanKey = false;
			}
		});

	}
	
	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
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
