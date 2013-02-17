
Ptero.Crater.panes = (function() {

	var topPane, frontPane, rightPane;

	function init() {
		var w = Ptero.Crater.screen.getPaneWidth();
		var h = Ptero.Crater.screen.getPaneHeight();

		var frustum = Ptero.screen.getFrustum();

		topPane = new Ptero.Crater.Pane( w,h, ['x','z']);
		frontPane = new Ptero.Crater.Pane( w,h, ['x','y']);
		rightPane = new Ptero.Crater.Pane( w,h, ['z','y']);
		topPane.fitFrustum(frustum);
		frontPane.fitFrustum(frustum);
		rightPane.fitFrustum(frustum);
	};

	function draw(ctx) {
		var w = Ptero.Crater.screen.getPaneWidth();
		var h = Ptero.Crater.screen.getPaneHeight();

		function drawPane(pane,x,y) {
			ctx.beginPath();
			ctx.rect(x,y,w,h);
			ctx.clip();
			ctx.translate(x,y);
			pane.draw(ctx);
			ctx.translate(-x,-y);
			ctx.resetClip();
		}

		drawPane(topPane,w,0);
		drawPane(frontPane,w,h);
		drawPane(rightPane,0,h);
	};

	function update(dt) {
	};

	return {
		init: init,
		draw: draw,
		update: update,
	};
})();
