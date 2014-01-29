
(function(){
	var paths = [
		function(ctx) {
			ctx.fillStyle='#CECECE';
			ctx.beginPath();
			ctx.moveTo(1923,0);
			ctx.lineTo(3847,0);
			ctx.quadraticCurveTo(3847,0,3847,0);
			ctx.lineTo(3847,1082);
			ctx.quadraticCurveTo(3847,1082,3847,1082);
			ctx.lineTo(1923,1082);
			ctx.quadraticCurveTo(1923,1082,1923,1082);
			ctx.lineTo(1923,0);
			ctx.quadraticCurveTo(1923,0,1923,0);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(1923,0);
			ctx.quadraticCurveTo(1923,0,1923,0);
			ctx.lineTo(1923,1082);
			ctx.quadraticCurveTo(1923,1082,1923,1082);
			ctx.lineTo(0,1082);
			ctx.quadraticCurveTo(0,1082,0,1082);
			ctx.lineTo(0,0);
			ctx.quadraticCurveTo(0,0,0,0);
			ctx.closePath();
			ctx.fillStyle="#000";
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.beginPath();
			ctx.moveTo(3844,0);
			ctx.lineTo(5767,0);
			ctx.quadraticCurveTo(5767,0,5767,0);
			ctx.lineTo(5767,1082);
			ctx.quadraticCurveTo(5767,1082,5767,1082);
			ctx.lineTo(3844,1082);
			ctx.quadraticCurveTo(3844,1082,3844,1082);
			ctx.lineTo(3844,0);
			ctx.quadraticCurveTo(3844,0,3844,0);
			ctx.closePath();
			ctx.fillStyle="#000";
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(226,228,228,1)';
			ctx.beginPath();
			ctx.moveTo(2256,187);
			ctx.lineTo(3512,187);
			ctx.quadraticCurveTo(3512,187,3512,187);
			ctx.lineTo(3512,894);
			ctx.quadraticCurveTo(3512,894,3512,894);
			ctx.lineTo(2256,894);
			ctx.quadraticCurveTo(2256,894,2256,894);
			ctx.lineTo(2256,187);
			ctx.quadraticCurveTo(2256,187,2256,187);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(193,193,193,1)';
			ctx.beginPath();
			ctx.moveTo(3404,249);
			ctx.lineTo(3726,0);
			ctx.lineTo(3847,0);
			ctx.lineTo(3847,109);
			ctx.lineTo(3404,249);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(250,250,250,1)';
			ctx.beginPath();
			ctx.moveTo(2366,249);
			ctx.lineTo(3404,249);
			ctx.quadraticCurveTo(3404,249,3404,249);
			ctx.lineTo(3404,833);
			ctx.quadraticCurveTo(3404,833,3404,833);
			ctx.lineTo(2366,833);
			ctx.quadraticCurveTo(2366,833,2366,833);
			ctx.lineTo(2366,249);
			ctx.quadraticCurveTo(2366,249,2366,249);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(193,193,193,1)';
			ctx.beginPath();
			ctx.moveTo(2366,249);
			ctx.lineTo(2044,0);
			ctx.lineTo(1923,0);
			ctx.lineTo(1923,109);
			ctx.lineTo(2366,249);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(193,193,193,1)';
			ctx.beginPath();
			ctx.moveTo(2366,833);
			ctx.lineTo(2044,1082);
			ctx.lineTo(1923,1082);
			ctx.lineTo(1923,973);
			ctx.lineTo(2366,833);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
		function(ctx) {
			ctx.fillStyle='rgba(193,193,193,1)';
			ctx.beginPath();
			ctx.moveTo(3404,833);
			ctx.lineTo(3726,1082);
			ctx.lineTo(3847,1082);
			ctx.lineTo(3847,973);
			ctx.lineTo(3404,833);
			ctx.closePath();
			ctx.strokeStyle="rgba(0,0,0,0)";
		},
	];
	return {
		shapeCompatible: true,
		paths: paths,
	};
})();

