function addParallax() {

	var $window = $(window);
	var $document = $(document);

	var maxScrollTop = 0;
	function computeMaxScrollTop() {
		maxScrollTop = $document.height() - $window.height();
	}
	computeMaxScrollTop();
	$window.resize(computeMaxScrollTop);

	function update() {
		var scrollTop = $window.scrollTop();
		Ptero.scene.setFracTime(maxScrollTop == 0 ? 0 : scrollTop / maxScrollTop);
		console.log(scrollTop, maxScrollTop);
		Ptero.scene.draw();
	}
	console.log('binding scroll');
	$window.bind('scroll', update);
	update();
}
