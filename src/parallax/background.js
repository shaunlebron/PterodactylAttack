
Ptero.Parallax.background = (function(){

	var bgLayers,bgBlur;
	var bgFlat;
	var grassAnim;
	var scale;
	var layerDepths = [];
	var selectedLayer = null;
	var layerTiles = [];

	return {
		setSelectedLayer: function(i) {
			selectedLayer = i;
		},
		getSelectedLayer: function() {
			return selectedLayer;
		},
		getDepths: function() {
			return layerDepths;
		},
		getLayerSpaceRects: function(pos,i) {
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
			var step = 1;
			layerDepths = [
				far-step*5,
				far-step*4,
				far-step*3,
				far-step*2,
				far-step*1,
				far-step*0,
			];
			layerTiles = [
				bgLayers.frames["bg0"].tiles,
				[bgLayers.frames["bg1_0"].tiles, bgLayers.frames["bg1_1"].tiles],
				bgLayers.frames["bg2"].tiles,
				bgLayers.frames["bg3"].tiles,
				bgLayers.frames["bg4"].tiles,
				bgLayers.frames["bg5"].tiles,
			];
		},

		getScale: function getScale() { return scale; },
		update: function(dt) {
			grassAnim.update(dt);
			var pos = {x:0, y:0, z:Ptero.screen.getFrustum().near};
			for (i=0; i<6; i++) {
				var depth = layerDepths[i];
				var layer = "bg"+i;
				if (i == 1) {
					Ptero.deferredSprites.defer(
						function(ctx) {
							bgLayers.draw(ctx, pos,"bg1_1");
							grassAnim.draw(ctx,pos);
							bgLayers.draw(ctx, pos,"bg1_0");
						}, depth);
				}
				else {
					Ptero.deferredSprites.defer(
						(function(layer){
							return function(ctx) {
								bgLayers.draw(ctx, pos, layer);
							};
						})(layer), depth);
				}
			}
		},
	};
})();
