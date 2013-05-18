
Ptero.background = (function(){

	var bgLayers,bgBlur;
	var bgFlat;
	var grassAnim;
	var scale;
	var layerPositions = [];

	return {
		getDepths: function() {
			return layerDepths;
		},
		getLayerSpaceRects: function(i) {
			var pos = layerPositions[i];
			if (i == 1) {
				var a = bgLayers.getFrameSpaceRects(pos, "bg1_0");
				var b = bgLayers.getFrameSpaceRects(pos, "bg1_1");
				a.push.apply(a,b);
				return a;
			}
			else {
				return bgLayers.getFrameSpaceRects(pos, "bg"+i);
			}
		},
		setLayerDepth: function(i,z) {
			layerPositions[i].z = z;
			var near = Ptero.screen.getFrustum().near;
			var scale = 1/near*z;
			console.log(scale);
			if (i==1) {
				bgLayers.billboards["bg1_0"].scale = scale;
				bgLayers.billboards["bg1_1"].scale = scale;
			}
			else {
				bgLayers.billboards["bg"+i].scale = scale;
			}
		},
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

			var far = Ptero.screen.getFrustum().far;
			var near = Ptero.screen.getFrustum().near;
			var zlen = far-near;
			var step = zlen/5;
			layerPositions = [];
			var i;
			for (i=0; i<6; i++) {
				layerPositions[i] = {x:0,y:0};
				this.setLayerDepth(i, far-step*(5-i));
			}
		},

		getScale: function getScale() { return scale; },
		update: function(dt) {
			grassAnim.update(dt);
			for (i=0; i<6; i++) {
				var layer = "bg"+i;
				var pos = layerPositions[i];
				if (i == 1) {
					Ptero.deferredSprites.defer(
						(function(pos){
							return function(ctx) {
								bgLayers.draw(ctx, pos,"bg1_1");
								grassAnim.draw(ctx,{x:0,y:0,z:Ptero.screen.getFrustum().near});
								bgLayers.draw(ctx, pos,"bg1_0");
							};
						})(pos), pos.z);
				}
				else {
					Ptero.deferredSprites.defer(
						(function(pos,layer){
							return function(ctx) {
								bgLayers.draw(ctx, pos, layer);
							};
						})(pos,layer), pos.z);
				}
			}
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
				}
			}
		},
	};
})();
