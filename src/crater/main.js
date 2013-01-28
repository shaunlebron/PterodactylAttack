
Ptero.Crater = Ptero.Crater || {};

window.onload = function() {

	// Create the canvas element.
	var canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	Ptero.assets.load(function(){
		Ptero.Crater.screen.init(canvas);
		Ptero.input.init();
		Ptero.setScene(Ptero.Crater.scene_crater);
		Ptero.Crater.executive.start();
	});
};
