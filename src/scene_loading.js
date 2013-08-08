
Ptero.scene_loading = (function(){

	var bgSprite, bgPos;

	return {
		init: function() {
			console.log('loading screen init');
			bgSprite = Ptero.assets.sprites['title'];
			var frustum = Ptero.screen.getFrustum();
			bgPos = {
				x:0,
				y:0,
				z: frustum.near,
			};
		},
		update: function(dt) {
		},
		draw: function(ctx) {
			bgSprite.draw(ctx, bgPos);
		},
	};
})();
