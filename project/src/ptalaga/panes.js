
Ptero.Ptalaga.panes = (function() {

	var topPane, frontPane, rightPane, livePane, timePane, rotPane;
	var panes;

	var paneWidth,paneHeight,timePaneHeight,timePaneWidth,rotPaneWidth,rotPaneHeight;

	function init() {
		var w = Ptero.Ptalaga.screen.getPaneWidth();
		var h = Ptero.Ptalaga.screen.getPaneHeight();
		paneWidth = w;
		paneHeight = h;
		rotPaneHeight = timePaneHeight = Ptero.Ptalaga.screen.getTimePaneHeight();
		rotPaneWidth = 100;
		timePaneWidth = 2*w - rotPaneWidth;

		var frustum = Ptero.frustum;

		// Create the panes for each projection.
		topPane = new Ptero.Ptalaga.Pane( w,h, ['x','z'], 'top');
		frontPane = new Ptero.Ptalaga.Pane( w,h, ['x','y'], 'front');
		rightPane = new Ptero.Ptalaga.Pane( w,h, ['z','y'], 'right');

		// Set the pane windows to fit the frustum.
		topPane.fitFrustum(frustum);
		frontPane.fitFrustum(frustum);
		rightPane.fitFrustum(frustum);
		
		// Make all pane scales consistent.
		var scale = Math.min(topPane.scale, frontPane.scale, rightPane.scale);
		topPane.minScale = frontPane.minScale = rightPane.minScale = scale;
		topPane.zoom(scale);
		frontPane.zoom(scale);
		rightPane.zoom(scale);

		// Set the live pane to a scene and initialize it.
		livePane = new Ptero.Ptalaga.LivePane();
		livePane.init();

		rotPane = new Ptero.Ptalaga.RotationPane(rotPaneWidth, rotPaneHeight);
		timePane = new Ptero.Ptalaga.TimePane(timePaneWidth, timePaneHeight, 20);

		// This determines the position of the panes on the screen.
		panes = [livePane, topPane, rightPane, frontPane];

		initControls();
	};

	function getPaneFromXY(x,y) {
		if (y > 2*paneHeight) {
			if (x > rotPaneWidth) {
				return timePane;
			}
			else {
				return rotPane;
			}
		}
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

		if (pane == timePane) {
			return {
				x: rotPaneWidth,
				y: 2*h,
				w: timePane.pixelW,
				h: timePane.pixelH,
			};
		}
		else if (pane == rotPane) {
			return {
				x: 0,
				y: 2*h,
				w: rotPane.pixelW,
				h: rotPane.pixelH,
			};
		}

		var i;
		for (i=0; i<4; i++) {
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
		for (i=0; i<4; i++) {
			drawPane(panes[i]);
		}
		drawPane(timePane);
		drawPane(rotPane);

		// Draw pane borders.
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(w,0);
		ctx.lineTo(w,2*h);
		ctx.moveTo(0,h);
		ctx.lineTo(2*w,h);
		ctx.moveTo(0,2*h);
		ctx.lineTo(2*w,2*h);
		ctx.moveTo(rotPaneWidth,2*h);
		ctx.lineTo(rotPaneWidth,2*h+rotPaneHeight);
		ctx.stroke();

	};

	function update(dt) {
		var i;
		for (i=0; i<4; i++) {
			panes[i].update(dt);
		}
		timePane.update(dt);
	};

	return {
		init: init,
		draw: draw,
		update: update,
		getTimePane: function() { return timePane; },
	};
})();
