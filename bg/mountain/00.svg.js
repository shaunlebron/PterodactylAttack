
(function(){
	var paths = [
		function(ctx) {
			ctx.fillStyle='#00FFFF';
			ctx.strokeStyle='#000000';
			ctx.miterLimit='10';
			ctx.beginPath();
			ctx.moveTo(8873,-5);
			ctx.lineTo(11145,-5);
			ctx.quadraticCurveTo(11145,-5,11145,-5);
			ctx.lineTo(11145,1074);
			ctx.quadraticCurveTo(11145,1074,11145,1074);
			ctx.lineTo(8873,1074);
			ctx.quadraticCurveTo(8873,1074,8873,1074);
			ctx.lineTo(8873,-5);
			ctx.quadraticCurveTo(8873,-5,8873,-5);
			ctx.closePath();
		},
	];
	return {
		shapeCompatible: true,
		paths: paths,
	};
})();

