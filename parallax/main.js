window.onload = function() {

	var canvas = document.getElementById('c');
	var w,h;

	w = 500;
	h = w/16*9;

	console.log("initing screen");
	Ptero.screen.init(canvas,w,h);

	Ptero.assets.load(function() {
		console.log('starting scene');
		Ptero.scene.init();
		addParallax();
	});
};
