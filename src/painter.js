
// Drawing functions that take 3d frustum coordinates.
Ptero.painter = (function(){

	function drawImageFrame(ctx,image,pos,sx,sy,sw,sh,billboard) {
		var rect = billboard.getScreenRect(pos);
		var dx = rect.x;
		var dy = rect.y;
		var dw = rect.w;
		var dh = rect.h;
		ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
	};

	function drawImage(ctx,image,billboard) {
		var sx = 0;
		var sy = 0;
		var sw = image.width;
		var sh = image.height;
		drawImageFrame(ctx,image,sx,sy,sw,sh,billboard);
	};

	return {
		drawImageFrame: drawImageFrame,
		drawImage: drawImage,
	};
})();
