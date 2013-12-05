function addParallax() {

	var $window = $(window);
	var $document = $(document);
	var $canvas = $('#c');

	var startScroll;
	var endScroll;
	var scrollRange;

	function computeScrollRange() {
		var windowHeight = $window.height();
		var documentHeight = $document.height();
		var canvasTop = $canvas.offset().top;
		var canvasHeight = $canvas.height();
		startScroll = Math.max(0, canvasTop - windowHeight);
		endScroll = Math.min(documentHeight - windowHeight, canvasTop + canvasHeight + windowHeight);
		scrollRange = (endScroll - startScroll);
	}

	function resize() {
		Ptero.screen.resizeCanvas($canvas.width(), $canvas.height());
		computeScrollRange();
		scroll();
	}

	function scroll() {
		var scrollTop = $window.scrollTop();
		if (startScroll < scrollTop && scrollTop < endScroll) {
			Ptero.scene.setFracTime(scrollRange == 0 ? 0 : (scrollTop-startScroll) / scrollRange);
			Ptero.scene.draw();
		}
	}

	$window.resize(resize);
	$window.bind('scroll', scroll);

	resize();
}
