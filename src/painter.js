
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

	function drawBorder(ctx,pos,color,billboard,handle) {
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
		}

		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		if (handle) {
			var r = 4;
			ctx.beginPath();
			ctx.moveTo(dx+dw/2-r, dy);
			ctx.lineTo(dx,dy);
			ctx.lineTo(dx,dy+dh);
			ctx.lineTo(dx+dw,dy+dh);
			ctx.lineTo(dx+dw,dy);
			ctx.lineTo(dx+dw/2+r, dy);
			ctx.arc(dx+dw/2,dy,r,0,Math.PI*2);
			ctx.stroke();
		}
		else {
			ctx.strokeRect(dx,dy,dw,dh);
		}

		if (angle) {
			ctx.rotate(-angle);
			ctx.translate(-x,-y);
		}
	};

	return {
		drawImageFrame: drawImageFrame,
		drawImage: drawImage,
		drawBorder: drawBorder,
	};
})();
