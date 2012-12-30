Ptero.orb = (function(){

	var rAspect = 1/2*0.8; // radius multipler on half of screen height

	var draw = function(ctx) {
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		var radius = Ptero.screen.getHeight()/2 * rAspect;
		var x = Ptero.screen.getWidth()/2;
		var y = Ptero.screen.getHeight();
		ctx.arc(x,y,radius, 0, 2*Math.PI);
		ctx.fill();
	};

	return {
		draw: draw,
	};
})();
