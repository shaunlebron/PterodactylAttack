// 02_sky_right_to_left.svg
(function(){

	var paths = [
		function(ctx){
			//ctx.globalAlpha = 0.2;
			//ctx.fillStyle='#3E368E';
			ctx.fillStyle = 'rgba(62, 54, 142, 0.2)';
			ctx.beginPath();
			ctx.moveTo(9491,63);
			ctx.bezierCurveTo(9462,60,9269,99,9110,90);
			ctx.bezierCurveTo(8952,81,8652,27,8508,42);
			ctx.bezierCurveTo(8363,57,8349,132,8131,150);
			ctx.bezierCurveTo(7913,168,7655,9,7511,36);
			ctx.bezierCurveTo(7367,63,7134,120,6856,123);
			ctx.bezierCurveTo(6578,126,6338,183,6218,210);
			ctx.bezierCurveTo(6099,237,6208,237,6250,336);
			ctx.bezierCurveTo(6292,435,6363,444,6581,429);
			ctx.bezierCurveTo(6800,414,6923,285,7134,273);
			ctx.bezierCurveTo(7345,261,7733,450,7863,456);
			ctx.bezierCurveTo(7994,462,8568,270,8687,297);
			ctx.bezierCurveTo(8807,324,8825,489,9050,492);
			ctx.bezierCurveTo(9276,495,9487,459,9550,426);
			ctx.bezierCurveTo(9614,393,9603,105,9593,102);
			ctx.bezierCurveTo(9582,99,9491,63,9491,63);
			ctx.closePath();
		},
		function(ctx){
			//ctx.globalAlpha = 0.2;
			//ctx.fillStyle='#3E368E';
			ctx.fillStyle = 'rgba(62, 54, 142, 0.2)';
			ctx.beginPath();
			ctx.moveTo(6378,6);
			ctx.lineTo(6538,28);
			ctx.bezierCurveTo(6538,28,6792,7,6933,7);
			ctx.bezierCurveTo(7073,7,7211,36,7285,7);
			ctx.bezierCurveTo(7359,-21,7390,7,7484,7);
			ctx.bezierCurveTo(7578,7,7689,33,7754,7);
			ctx.bezierCurveTo(7820,-18,7726,68,7909,68);
			ctx.bezierCurveTo(8092,68,8489,145,8489,68);
			ctx.bezierCurveTo(8489,-7,8874,105,8874,68);
			ctx.bezierCurveTo(8874,32,9230,86,9273,68);
			ctx.bezierCurveTo(9317,51,9410,15,9434,5);
			ctx.bezierCurveTo(9459,-4,9428,-98,9395,-96);
			ctx.bezierCurveTo(9363,-94,6289,-96,6294,-93);
			ctx.bezierCurveTo(6299,-90,6308,8,6308,8);
			ctx.lineTo(6378,6);
			ctx.closePath();
		},
		function(ctx){
			//ctx.globalAlpha = 0.2;
			//ctx.fillStyle='#3E368E';
			ctx.fillStyle = 'rgba(62, 54, 142, 0.2)';
			ctx.beginPath();
			ctx.moveTo(6270,-41);
			ctx.lineTo(6421,-67);
			ctx.bezierCurveTo(6421,-67,6641,-39,6670,-36);
			ctx.bezierCurveTo(6698,-33,7123,-51,7132,-54);
			ctx.bezierCurveTo(7142,-56,7536,-55,7557,-55);
			ctx.bezierCurveTo(7578,-55,7930,-40,7963,-35);
			ctx.bezierCurveTo(7996,-29,8074,30,8142,28);
			ctx.bezierCurveTo(8210,25,8297,-17,8398,-27);
			ctx.bezierCurveTo(8499,-36,8834,-45,8919,-37);
			ctx.bezierCurveTo(9003,-29,9109,3,9189,5);
			ctx.bezierCurveTo(9269,6,9337,-33,9405,-27);
			ctx.bezierCurveTo(9473,-20,9485,94,9466,104);
			ctx.bezierCurveTo(9447,115,9229,137,9177,134);
			ctx.bezierCurveTo(9125,131,8830,156,8830,156);
			ctx.bezierCurveTo(8830,156,8656,178,8433,165);
			ctx.bezierCurveTo(8210,151,8102,108,7855,107);
			ctx.bezierCurveTo(7609,106,7566,192,7332,192);
			ctx.bezierCurveTo(7097,192,7095,158,6900,100);
			ctx.bezierCurveTo(6705,42,6590,45,6547,64);
			ctx.bezierCurveTo(6505,83,6402,145,6322,108);
			ctx.bezierCurveTo(6242,72,6216,59,6169,17);
			ctx.bezierCurveTo(6123,-24,6270,-41,6270,-41);
			ctx.closePath();
		},
	];

	return {
		shapeCompatible: false,
		paths: paths,
	};

})();
