
Ptero.background = (function(){

	var bgLayers,bgBlur;
	var bgFlat;
	var grassAnim;
	var scale;
	var layerPositions = [];
	var selectedLayer = null;

	var parallaxOffset = 0;

	return {
		setSelectedLayer: function(i) {
			selectedLayer = i;
		},
		getLayerDepth: function(i) {
			return layerPositions[i].z;
		},
		getLayerDepths: function() {
			var depths = [];
			var i,len=layerPositions.length;
			for (i=0; i<len; i++) {
				depths.push(layerPositions[i].z);
			}
			return depths;
		},
		setLayerDepths: function(depths) {
			var i,len=depths.length;
			for (i=0; i<len; i++) {
				this.setLayerDepth(i, depths[i]);
			}
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
			if (i==1) {
				bgLayers.billboards["bg1_0"].scale = scale;
				bgLayers.billboards["bg1_1"].scale = scale;
				bgLayersDesat.billboards["bg1_0"].scale = scale;
				bgLayersDesat.billboards["bg1_1"].scale = scale;
			}
			else {
				bgLayers.billboards["bg"+i].scale = scale;
				bgLayersDesat.billboards["bg"+i].scale = scale;
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
			bgLayersDesat = Ptero.assets.mosaics["bgLayersDesat"];
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

			var savedDepths = Ptero.assets.json["bgLayerDepths"];
			if (savedDepths) {
				this.setLayerDepths(savedDepths.depths);
			}

			window.addEventListener("deviceorientation", function(orientData) {
				parallaxOffset = orientData.beta/500;
			}, true);
		},

		getScale: function getScale() { return scale; },
		update: function(dt) {
			grassAnim.update(dt);
			for (i=0; i<6; i++) {
				var layer = "bg"+i;
				var _pos = layerPositions[i];
				var pos = {
					x: _pos.x + parallaxOffset,
					y: _pos.y,
					z: _pos.z,
				};
				var desat = (selectedLayer != null && selectedLayer != i);
				if (i == 1) {
					Ptero.deferredSprites.defer(
						(function(pos,desat){
							return function(ctx) {
								if (desat) {
									bgLayersDesat.draw(ctx, pos,"bg1_1");
									grassAnim.draw(ctx,{x:parallaxOffset,y:0,z:Ptero.screen.getFrustum().near});
									bgLayersDesat.draw(ctx, pos,"bg1_0");
								}
								else {
									bgLayers.draw(ctx, pos,"bg1_1");
									grassAnim.draw(ctx,{x:0,y:0,z:Ptero.screen.getFrustum().near});
									bgLayers.draw(ctx, pos,"bg1_0");
								}
							};
						})(pos,desat), pos.z);
				}
				else {
					Ptero.deferredSprites.defer(
						(function(pos,layer,desat){
							return function(ctx) {
								if (desat) {
									bgLayersDesat.draw(ctx, pos, layer);
								}
								else {
									bgLayers.draw(ctx, pos, layer);
								}
							};
						})(pos,layer,desat), pos.z);
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
