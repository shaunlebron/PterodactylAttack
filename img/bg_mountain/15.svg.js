(function(){

	function makeShape(pathfuncs) {
		var shape = new Shape();
		var i,len=pathfuncs.length;
		for (i=0; i<len; i++) {
			var ctx = new Path();
			pathfuncs[i](ctx);
			shape.addPath(ctx);
		}
		return shape;
	}

	return makeShape([
			function(ctx){
			ctx.fillStyle='#475E19';
			ctx.beginPath();
			ctx.moveTo(7152,729);
			ctx.bezierCurveTo(6258,474,5380,1029,5380,1029);
			ctx.bezierCurveTo(5380,1029,5698,1461,4776,875);
			ctx.bezierCurveTo(3854,289,2988,838,2988,838);
			ctx.lineTo(2987,839);
			ctx.bezierCurveTo(2984,881,2981,923,2980,965);
			ctx.bezierCurveTo(2977,1037,2978,1110,2978,1182);
			ctx.bezierCurveTo(2977,1255,2977,1328,2979,1400);
			ctx.bezierCurveTo(2979,1412,2979,1425,2980,1437);
			ctx.lineTo(7820,1437);
			ctx.lineTo(8416,1103);
			ctx.bezierCurveTo(8416,1103,8046,983,7152,729);
			ctx.closePath();
			}
		]);

})();
