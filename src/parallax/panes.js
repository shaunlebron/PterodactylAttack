
Ptero.Parallax.panes = (function() {

	var topPane, livePane;
	var panes;

	var paneWidth,paneHeight;

	function init() {
		var w = Ptero.Parallax.screen.getPaneWidth();
		var h = Ptero.Parallax.screen.getPaneHeight();
		paneWidth = w;
		paneHeight = h;

		var frustum = Ptero.screen.getFrustum();

		// Create the panes for each projection.
		topPane = new Ptero.Parallax.Pane( w,h, ['x','z'], 'top');

		// Set the pane windows to fit the frustum.
		topPane.fitFrustum(frustum);
		
		// Set the live pane to a scene and initialize it.
		livePane = new Ptero.Parallax.LivePane();
		livePane.init();

		// This determines the position of the panes on the screen.
		panes = [livePane, topPane];

		initControls();
	};

	function getPaneFromXY(x,y) {
		var row = Math.floor(y/paneHeight);
		var col = Math.floor(x/paneWidth);
		return panes[row*2+col];
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

		var i;
		for (i=0; i<2; i++) {
			if (pane == panes[i]) {
				break;
			}
		}

		var row = Math.floor(i/2);
		var col = i%2;

		return {
			x: col*w,
			y: row*h,
			w: w,
			h: h,
		};
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

		var i=0, row, col;
		for (i=0; i<2; i++) {
			drawPane(panes[i]);
		}

	};

	function update(dt) {
		var i;
		for (i=0; i<2; i++) {
			panes[i].update(dt);
		}
	};

	return {
		init: init,
		draw: draw,
		update: update,
	};
})();
