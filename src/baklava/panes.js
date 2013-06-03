
Ptero.Baklava.panes = (function() {

	var topPane, rightPane, livePane;
	var panes;

	var paneWidth,paneHeight;

	function init() {
		var w = Ptero.Baklava.screen.getPaneWidth();
		var h = Ptero.Baklava.screen.getPaneHeight();
		paneWidth = w;
		paneHeight = h;

		var frustum = Ptero.screen.getFrustum();

		// Create the panes for each projection.
		topPane = new Ptero.Baklava.Pane( w,h, ['x','z'], 'top');
		rightPane = new Ptero.Baklava.Pane( w,h, ['z','y'], 'right');

		// Set the pane windows to fit the frustum.
		topPane.fitFrustum(frustum);
		rightPane.fitFrustum(frustum);

		var scale = Math.min(topPane.scale, rightPane.scale);
		topPane.minScale = rightPane.minScale = scale;
		topPane.zoom(scale);
		rightPane.zoom(scale);
		
		// Set the live pane to a scene and initialize it.
		livePane = new Ptero.Baklava.LivePane();
		livePane.init();

		// This determines the position of the panes on the screen.
		panes = [livePane, topPane, rightPane];

		initControls();
	};

	function getPaneFromXY(x,y) {
		if (y < paneHeight * 2) {
			return livePane;
		}
		else {
			return (x < paneWidth) ? topPane : rightPane;
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

		if (pane == livePane) {
			return {
				x: 0,
				y: 0,
				w: 2*w,
				h: 2*h,
			};
		}
		else if (pane == topPane) {
			return {
				x: 0,
				y: 2*h,
				w: w,
				h: h,
			};
		}
		else if (pane == rightPane) {
			return {
				x: w,
				y: 2*h,
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

		var i,len=panes.length;
		for (i=0; i<len; i++) {
			drawPane(panes[i]);
		}

		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0,2*h);
		ctx.lineTo(2*w,2*h);
		ctx.moveTo(w,2*h);
		ctx.lineTo(w,3*h);
		ctx.stroke();
	};

	function update(dt) {
		var i,len=panes.length;
		for (i=0; i<len; i++) {
			panes[i].update(dt);
		}
	};

	return {
		init: init,
		draw: draw,
		update: update,
		getLivePane: function() { return livePane; },
	};
})();
