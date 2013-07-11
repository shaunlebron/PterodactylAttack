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
		ctx.fillStyle='#52594D';
		ctx.beginPath();
		ctx.moveTo(9462,801);
		ctx.bezierCurveTo(8581,801,8661,517,8245,445);
		ctx.bezierCurveTo(8252,437,8258,426,8265,418);
		ctx.bezierCurveTo(8250,412,8237,411,8222,405);
		ctx.bezierCurveTo(8205,399,8190,409,8172,405);
		ctx.bezierCurveTo(8142,399,8115,406,8085,403);
		ctx.bezierCurveTo(8079,402,8062,389,8068,380);
		ctx.bezierCurveTo(8058,380,8044,381,8040,394);
		ctx.bezierCurveTo(8031,392,8023,374,8017,366);
		ctx.bezierCurveTo(8000,376,7991,368,7973,368);
		ctx.bezierCurveTo(7954,367,7935,378,7917,379);
		ctx.bezierCurveTo(7897,381,7877,374,7857,375);
		ctx.bezierCurveTo(7850,376,7844,393,7836,395);
		ctx.bezierCurveTo(7829,396,7825,400,7818,398);
		ctx.bezierCurveTo(7810,396,7803,400,7796,403);
		ctx.bezierCurveTo(7788,406,7783,404,7775,404);
		ctx.bezierCurveTo(7766,404,7757,408,7750,411);
		ctx.bezierCurveTo(7746,397,7714,412,7707,414);
		ctx.bezierCurveTo(7700,417,7693,420,7685,421);
		ctx.bezierCurveTo(7675,424,7650,423,7642,432);
		ctx.lineTo(7620,456);
		ctx.bezierCurveTo(7621,456,7622,456,7623,456);
		ctx.bezierCurveTo(7236,525,6990,692,6309,692);
		ctx.bezierCurveTo(6240,692,6177,690,6118,685);
		ctx.bezierCurveTo(6123,741,6128,796,6133,851);
		ctx.bezierCurveTo(6139,914,6145,977,6151,1039);
		ctx.bezierCurveTo(6156,1102,6162,1164,6163,1227);
		ctx.bezierCurveTo(6164,1352,6157,1478,6151,1603);
		ctx.bezierCurveTo(6149,1640,6147,1677,6146,1715);
		ctx.bezierCurveTo(7043,1754,8478,1816,8490,1805);
		ctx.bezierCurveTo(8508,1789,10158,1257,10158,1257);
		ctx.bezierCurveTo(10158,1257,10416,801,9462,801);
		ctx.closePath();
		}
	]);

})();
