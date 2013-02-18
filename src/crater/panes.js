
Ptero.Crater.panes = (function() {

	var topPane, frontPane, rightPane, livePane;
	var panes;

	var paneWidth,paneHeight;

	function init() {
		var w = Ptero.Crater.screen.getPaneWidth();
		var h = Ptero.Crater.screen.getPaneHeight();
		paneWidth = w;
		paneHeight = h;

		var frustum = Ptero.screen.getFrustum();

		// Create the panes for each projection.
		topPane = new Ptero.Crater.Pane( w,h, ['x','z'], 'top');
		frontPane = new Ptero.Crater.Pane( w,h, ['x','y'], 'front');
		rightPane = new Ptero.Crater.Pane( w,h, ['z','y'], 'right');

		// Set the pane windows to fit the frustum.
		topPane.fitFrustum(frustum);
		frontPane.fitFrustum(frustum);
		rightPane.fitFrustum(frustum);
		
		// Make all pane scales consistent.
		var scale = Math.min(topPane.scale, frontPane.scale, rightPane.scale);
		topPane.zoom(scale);
		frontPane.zoom(scale);
		rightPane.zoom(scale);

		// Set the live pane to a scene and initialize it.
		livePane = new Ptero.Crater.LivePane();
		livePane.init();

		// This determines the position of the panes on the screen.
		panes = [livePane, topPane, rightPane, frontPane];

		initControls();
	};

	function getPaneFromXY(x,y) {
		var row = Math.floor(y/paneHeight);
		var col = Math.floor(x/paneWidth);
		return panes[row*2+col];
	};

	function getPaneRect(pane) {
		var w = paneWidth;
		var h = paneHeight;

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
		Ptero.input.addTouchHandler({
			start: function(x,y) {
			},
			move: function(x,y) {
			},
			end: function(x,y) {
			},
			cancel: function(x,y) {
			},
		});
	};

	function draw(ctx) {
		var w = paneWidth;
		var h = paneHeight;

		function drawPane(pane,x,y) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(x,y,w,h);
			ctx.clip();
			ctx.translate(x,y);
			pane.draw(ctx);
			ctx.restore();
		}

		var i=0, row, col;
		for (i=0; i<4; i++) {
			row = Math.floor(i/2);
			col = i%2;
			drawPane(panes[i], col*w, row*h);
		}

		// Draw pane borders.
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(w,0);
		ctx.lineTo(w,2*h);
		ctx.moveTo(0,h);
		ctx.lineTo(2*w,h);
		ctx.stroke();
	};

	function update(dt) {
		var i;
		for (i=0; i<4; i++) {
			panes[i].update(dt);
		}
	};

	return {
		init: init,
		draw: draw,
		update: update,
	};
})();
