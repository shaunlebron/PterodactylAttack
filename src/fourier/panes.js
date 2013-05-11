
Ptero.Fourier.panes = (function() {

	var livePane, timePane;
	var panes;

	var paneWidth,paneHeight,timePaneWidth,timePaneHeight;

	function init() {
		var w = Ptero.Fourier.screen.getPaneWidth();
		var h = Ptero.Fourier.screen.getPaneHeight();
		paneWidth = w;
		paneHeight = h;
		timePaneWidth = w;
		timePaneHeight = Ptero.Fourier.screen.getTimePaneHeight();

		var frustum = Ptero.screen.getFrustum();

		// Set the live pane to a scene and initialize it.
		livePane = new Ptero.Fourier.LivePane();
		livePane.init();

		timePane = new Ptero.Fourier.TimePane(timePaneWidth, timePaneHeight, 20);

		initControls();
	};

	function getPaneFromXY(x,y) {
		if (y > paneHeight) {
			return timePane;
		}
		else {
			return livePane;
		}
	};

	function getXYRelativeToPane(x,y,pane) {
		var rect = getPaneRect(pane);
		return {
			x: x-rect.x,
			y: y-rect.y,
		};
	};

	function getPaneRect(pane) {
		var w = paneWidth;
		var h = paneHeight;

		if (pane == timePane) {
			return {
				x: 0,
				y: h,
				w: timePane.pixelW,
				h: timePane.pixelH,
			};
		}
		else if (pane == livePane) {
			return {
				x: 0,
				y: 0,
				w: w,
				h: h,
			};
		}
	};

	function initControls() {
		var pane;
		function start(x,y) {
			pane = getPaneFromXY(x,y);
			if (pane) {
				var pos = getXYRelativeToPane(x,y,pane);
				pane.mouseStart(pos.x,pos.y);
			}
		}
		function move(x,y) {
			if (pane) {
				var pos = getXYRelativeToPane(x,y,pane);
				pane.mouseMove(pos.x,pos.y);
			}
		}
		function end(x,y) {
			if (pane) {
				var pos = getXYRelativeToPane(x,y,pane);
				pane.mouseEnd(pos.x,pos.y);
				pane = null;
			}
		}
		function scroll(x,y,delta,deltaX,deltaY) {
			var pane = getPaneFromXY(x,y);
			if (pane) {
				var pos = getXYRelativeToPane(x,y,pane);
				pane.mouseScroll && pane.mouseScroll(pos.x, pos.y, delta,deltaX,deltaY);
			}
		}
		Ptero.input.addTouchHandler({
			start: start,
			move: move,
			end: end,
			cancel: end,
			scroll: scroll,
		});
	};

	function draw(ctx) {
		var w = paneWidth;
		var h = paneHeight;

		function drawPane(pane) {
			ctx.save();
			ctx.beginPath();
			var r = getPaneRect(pane);
			ctx.rect(r.x, r.y, r.w, r.h);
			ctx.clip();
			ctx.translate(r.x,r.y);
			pane.draw(ctx);
			ctx.restore();
		}

		drawPane(livePane);
		drawPane(timePane);

		// Draw pane borders.
		/*
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0,h);
		ctx.lineTo(w,h);
		ctx.stroke();
		*/
	};

	function update(dt) {
		livePane.update(dt);
		timePane.update(dt);
	};

	return {
		init: init,
		draw: draw,
		update: update,
	};
})();
