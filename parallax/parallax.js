function addParallax() {
	var $ = jQuery;

	var $window = $(window);
	var $document = $(document);
	var $canvas = $('#parallax-ptero');
	var $section = $('#parallax-quote');

	var scrollStart;
	var scrollEnd;
	var scrollRange;
	var windowHeight;
	var documentHeight;
	var canvasTop;
	var canvasHeight;
	var canvasWidth;
	var sectionTop;
	var sectionHeight;

	function computeScrollRange() {
		windowHeight = $window.height();
		documentHeight = $document.height();
		sectionTop = $section.offset().top;
		sectionHeight = $section.height();
		canvasWidth = $canvas.width();
		canvasHeight = $canvas.height();
		scrollStart = Math.max(0, sectionTop - windowHeight);
		scrollEnd = Math.min(documentHeight - windowHeight, sectionTop + sectionHeight);
		scrollRange = (scrollEnd - scrollStart);
	}

	var scrollOrigin;
	var canvasOrigin;
	var parallaxScale = 0.4;

	function resize() {
		var w = $canvas.width();
		var minH = $section.height();
		var h = Math.max(minH, w/16*9);
		$canvas.height(h);
		Ptero.screen.resizeCanvas(w,h);
		computeScrollRange();

		scrollOrigin = sectionTop + sectionHeight/2 - windowHeight/2;
		canvasOrigin = (windowHeight - canvasHeight) / 2;

		scroll();
	}

	function scroll() {
		var pos = $window.scrollTop();

		if (scrollStart < pos && pos < scrollEnd) {
			var k = scrollRange ? (pos-scrollStart) / scrollRange : 0;
			Ptero.scene.setFracTime(k);

			var y;
			if (canvasWidth >= 768) {
				$canvas.css({ position: 'fixed', top: -(pos - scrollOrigin) * parallaxScale + canvasOrigin});
			}
			else {
				$canvas.css({ position: 'relative', top: 0});
			}
			Ptero.scene.draw();
		}
	}

	$window.resize(resize);
	$window.bind('scroll', scroll);

	resize();
}
