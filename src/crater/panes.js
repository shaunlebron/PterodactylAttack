
Ptero.Crater.panes = (function() {

	var topPane, frontPane, rightPane, livePane;

	function init() {
		var w = Ptero.Crater.screen.getPaneWidth();
		var h = Ptero.Crater.screen.getPaneHeight();

		var frustum = Ptero.screen.getFrustum();

		// Create the panes for each projection.
		topPane = new Ptero.Crater.Pane( w,h, ['x','z']);
		frontPane = new Ptero.Crater.Pane( w,h, ['x','y']);
		rightPane = new Ptero.Crater.Pane( w,h, ['z','y']);

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
		livePane = Ptero.Crater.scene_crater;
		livePane.init();
	};

	function draw(ctx) {
		var w = Ptero.Crater.screen.getPaneWidth();
		var h = Ptero.Crater.screen.getPaneHeight();

		function drawPane(pane,x,y) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(x,y,w,h);
			ctx.clip();
			ctx.translate(x,y);
			pane.draw(ctx);
			ctx.restore();
		}

		drawPane(livePane,0,0);
		drawPane(topPane,w,0);
		drawPane(frontPane,w,h);
		drawPane(rightPane,0,h);

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
		livePane.update(dt);
		topPane.update(dt);
		frontPane.update(dt);
		rightPane.update(dt);
	};

	return {
		init: init,
		draw: draw,
		update: update,
	};
})();
