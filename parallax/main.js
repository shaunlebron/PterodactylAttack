jQuery(function() {

	var canvas = document.getElementById('parallax-ptero');
	var w,h;

	w = 500;
	h = w/16*9;

	Ptero.screen.init(canvas,w,h);

	Ptero.assets.load(function() {
		Ptero.createBackgrounds();
		Ptero.scene.init();
		addParallax();
	});
});
