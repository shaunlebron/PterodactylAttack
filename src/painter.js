
// Drawing functions that take 3d frustum coordinates.
Ptero.painter = (function(){

	function drawImageFrame(ctx,image,pos,sx,sy,sw,sh,billboard) {
		var rect = billboard.getScreenRect(pos);
		var dx = rect.x;
		var dy = rect.y;
		var dw = rect.w;
		var dh = rect.h;
		var x = dx + dw/2;
		var y = dy + dh/2;
		var angle = pos.angle;
		if (angle) {
			ctx.translate(x,y);
			ctx.rotate(angle);
			dx -= x;
			dy -= y;
			ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
			ctx.rotate(-angle);
			ctx.translate(-x,-y);
		}
		else {
			ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
		}
	};

	function drawImage(ctx,image,pos,billboard) {
		var sx = 0;
		var sy = 0;
		var sw = image.width;
		var sh = image.height;
		drawImageFrame(ctx,image,pos,sx,sy,sw,sh,billboard);
	};

	function drawBorder(ctx,pos,color,billboard) {
		var rect = billboard.getScreenRect(pos);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		var rect = billboard.getScreenRect(pos);
		var dx = rect.x;
		var dy = rect.y;
		var dw = rect.w;
		var dh = rect.h;
		var x = dx + dw/2;
		var y = dy + dh/2;
		var angle = pos.angle;
		if (angle) {
			ctx.translate(x,y);
			ctx.rotate(angle);
			dx -= x;
			dy -= y;
			ctx.strokeRect(dx,dy,dw,dh);
			ctx.rotate(-angle);
			ctx.translate(-x,-y);
		}
		else {
			ctx.strokeRect(dx,dy,dw,dh);
		}
	};

	return {
		drawImageFrame: drawImageFrame,
		drawImage: drawImage,
		drawBorder: drawBorder,
	};
})();
