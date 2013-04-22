
Ptero.background = (function(){

	var image,imageBlur;
	var grassAnim;
	var scale;

	return {
		getScale: function getScale() { return scale; },
		setImage: function setImage(img,imgBlur) {
			image = img;
			imageBlur = imgBlur;
			var aspect = image.width / image.height;
			var scaleH = Ptero.screen.getHeight() / image.height;
			var scaleW = Ptero.screen.getWidth() / image.width;
			scale = (aspect > Ptero.screen.getAspect()) ? scaleH : scaleW;
			grassAnim = new Ptero.AnimSprite({mosaic: Ptero.assets.mosaics.grass});
		},
		update: function(dt) {
			grassAnim.update(dt);
		},
		draw: function draw(ctx) {
			var sx = 0;
			var sy = 0;
			var sw = image.width;
			var sh = image.height;
			var dw = sw * scale;
			var dh = sh * scale;
			var dx = Ptero.screen.getWidth()/2 - dw/2;
			var dy = Ptero.screen.getHeight()/2 - dh/2;

			if (Ptero.executive.isPaused()) {
				ctx.drawImage(imageBlur,sx,sy,sw,sh, dx,dy,dw,dh);
			}
			else {
				ctx.drawImage(image, sx,sy,sw,sh, dx,dy,dw,dh);
				var pos = {
					x: 0,
					y: 0,
					z: Ptero.screen.getFrustum().near,
				};
				grassAnim.draw(ctx,pos);
			}
		},
	};
})();
