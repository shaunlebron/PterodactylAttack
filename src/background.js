
Ptero.background = (function(){

	var bgLayers,bgBlur;
	var bgFlat;
	var grassAnim;
	var scale;

	return {
		init: function() {
			var w = 1280;
			var h = 720;
			var aspect = w/h;
			var scaleH = Ptero.screen.getHeight() / h;
			var scaleW = Ptero.screen.getWidth() / w;
			scale = (aspect > Ptero.screen.getAspect()) ? scaleH : scaleW;
			bgFlat = Ptero.assets.sprites["desert"];
			bgLayers = Ptero.assets.mosaics["bgLayers"];
			bgBlur = Ptero.assets.sprites["bg_frosted"];
			grassAnim = new Ptero.AnimSprite({mosaic: Ptero.assets.mosaics.grass});
		},

		getScale: function getScale() { return scale; },
		update: function(dt) {
			grassAnim.update(dt);
		},
		draw: function draw(ctx) {
			var pos = {
				x: 0,
				y: 0,
				z: Ptero.screen.getFrustum().near,
			};

			if (Ptero.scene.isFading) {
				bgFlat.draw(ctx, pos);
			}
			else {
				if (Ptero.executive.isPaused()) {
					bgBlur.draw(ctx, pos);
				}
				else {
					bgLayers.draw(ctx, pos,"bg06_0");
					bgLayers.draw(ctx, pos,"bg06_1");
					bgLayers.draw(ctx, pos,"bg05");
					bgLayers.draw(ctx, pos,"bg04");
					bgLayers.draw(ctx, pos,"bg03");
					bgLayers.draw(ctx, pos,"bg02");
					grassAnim.draw(ctx,pos);
					bgLayers.draw(ctx, pos,"bg01_0");
					bgLayers.draw(ctx, pos,"bg01_1");
					bgLayers.draw(ctx, pos,"bg00");
				}
			}
		},
	};
})();
