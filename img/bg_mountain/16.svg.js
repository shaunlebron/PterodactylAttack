
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
			ctx.fillStyle='#717A3B';
			ctx.beginPath();
			ctx.moveTo(2872,1312);
			ctx.bezierCurveTo(2983,1211,3137,1131,3263,1051);
			ctx.bezierCurveTo(3398,964,3539,883,3691,830);
			ctx.bezierCurveTo(3838,779,3993,762,4144,726);
			ctx.bezierCurveTo(4309,686,4471,634,4637,595);
			ctx.bezierCurveTo(4998,510,5297,560,5643,676);
			ctx.bezierCurveTo(5762,716,5905,745,6015,805);
			ctx.bezierCurveTo(6015,805,6368,999,6368,999);
			ctx.bezierCurveTo(6368,999,7552,873,8416,1103);
			ctx.bezierCurveTo(9280,1333,8259,1645,8259,1645);
			ctx.lineTo(2653,1513);
			ctx.bezierCurveTo(2653,1513,2872,1312,2872,1312);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#788346';
			ctx.beginPath();
			ctx.moveTo(9352,949);
			ctx.bezierCurveTo(9352,949,8568,798,7496,1113);
			ctx.bezierCurveTo(6424,1429,7417,1317,7417,1317);
			ctx.lineTo(9520,1525);
			ctx.lineTo(9352,949);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#788346';
			ctx.beginPath();
			ctx.moveTo(2168,618);
			ctx.bezierCurveTo(2589,458,3783,544,4163,970);
			ctx.bezierCurveTo(4544,1397,3931,1805,3931,1805);
			ctx.lineTo(2331,1557);
			ctx.lineTo(1529,945);
			ctx.bezierCurveTo(1529,945,1742,780,2168,618);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#7E8446';
			ctx.beginPath();
			ctx.moveTo(5208,609);
			ctx.bezierCurveTo(5208,609,4961,522,4645,639);
			ctx.bezierCurveTo(4328,757,4805,718,4805,718);
			ctx.bezierCurveTo(4805,718,4535,598,5208,609);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#7E8446';
			ctx.beginPath();
			ctx.moveTo(5380,663);
			ctx.bezierCurveTo(5380,663,5532,660,5544,692);
			ctx.bezierCurveTo(5556,725,5491,729,5491,729);
			ctx.bezierCurveTo(5491,729,5380,691,5380,677);
			},
			function(ctx){
			ctx.fillStyle='rgba(0,0,0,0)';
			ctx.lineWidth=2;
			ctx.miterLimit='10';
			ctx.beginPath();
			ctx.moveTo(5104,555);
			},
			function(ctx){
			ctx.fillStyle='rgba(0,0,0,0)';
			ctx.lineWidth=2;
			ctx.miterLimit='10';
			ctx.beginPath();
			ctx.moveTo(4466,639);
			},
			function(ctx){
			ctx.fillStyle='#90995C';
			ctx.beginPath();
			ctx.moveTo(8223,970);
			ctx.bezierCurveTo(8223,970,8362,911,8700,994);
			ctx.bezierCurveTo(8700,994,8317,928,7979,1130);
			ctx.bezierCurveTo(7641,1333,8081,990,8223,970);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#90995C';
			ctx.beginPath();
			ctx.moveTo(8906,975);
			ctx.bezierCurveTo(8906,975,8876,1016,8810,1019);
			ctx.bezierCurveTo(8744,1023,8690,1064,8747,1078);
			ctx.bezierCurveTo(8804,1092,9056,966,8906,975);
			ctx.closePath();
			},
			function(ctx){
			ctx.fillStyle='#93995B';
			ctx.beginPath();
			ctx.moveTo(2636,585);
			ctx.bezierCurveTo(2636,585,2961,594,3273,665);
			ctx.bezierCurveTo(3585,735,3834,873,3838,891);
			ctx.bezierCurveTo(3843,909,3450,699,3009,714);
			ctx.bezierCurveTo(2568,729,2388,567,2636,585);
			ctx.closePath();
			ctx.fillStyle='#68703A';
			ctx.beginPath();
			ctx.moveTo(2348,733);
			}
		]);

})();
