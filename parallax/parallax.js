function addParallax() {
	var $ = jQuery;

	var $window = $(window);
	var $document = $(document);
	var $canvas = $('#parallax-ptero');

	var scrollStart;
	var scrollEnd;
	var scrollRange;
	var windowHeight;
	var documentHeight;
	var canvasTop;
	var canvasHeight;
	var canvasWidth;

	function computeScrollRange() {
		windowHeight = $window.height();
		documentHeight = $document.height();
		canvasTop = $canvas.offset().top;
		canvasWidth = $canvas.width();
		canvasHeight = $canvas.height();
		scrollStart = Math.max(0, canvasTop - windowHeight);
		scrollEnd = Math.min(documentHeight - windowHeight, canvasTop + canvasHeight);
		scrollRange = (scrollEnd - scrollStart);
	}

	var scrollOrigin;
	var fixedCanvasOriginOffset;
	var parallaxScale = 0.4;

	function resize() {
		Ptero.screen.resizeCanvas($canvas.width(), $canvas.height());
		computeScrollRange();

		scrollOrigin = canvasTop + canvasHeight/2 - windowHeight/2;
		fixedCanvasOriginOffset = (windowHeight - (canvasHeight + Ptero.screen.getWindowHeightDiff())) / 2;

		scroll();
	}

	function scroll() {
		var pos = $window.scrollTop();
		if (scrollStart < pos && pos < scrollEnd) {
			var k = scrollRange ? (pos-scrollStart) / scrollRange : 0;
			Ptero.scene.setFracTime(k);

			var y = 0;
			if (canvasWidth >= 768) {
				y = -(pos - scrollOrigin) * parallaxScale + pos + fixedCanvasOriginOffset - canvasTop;
			}
			Ptero.screen.setWindowTop(y);
			Ptero.scene.draw();
		}
	}

	$window.resize(resize);
	$window.bind('scroll', scroll);

	resize();
}
