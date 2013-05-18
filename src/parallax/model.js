
Ptero.Parallax.Model = function() {
	this.enemySprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
	this.enemyPos = {x:0,y:0,z:Ptero.screen.getFrustum().near*2};
};

Ptero.Parallax.Model.prototype = {
	selectLayer: function(i) {
		Ptero.background.setSelectedLayer(i);
		this.selectedLayer = i;
		this.enemySelected = false;
	},
	selectEnemy: function() {
		Ptero.background.setSelectedLayer(null);
		this.selectedLayer = null;
		this.enemySelected = true;
	},
	update: function(dt) {
		this.enemySprite.update(dt);
		var pos = this.enemyPos;
		var sprite = this.enemySprite;
		Ptero.deferredSprites.defer(function(ctx) {
			sprite.draw(ctx,pos);
		}, this.enemyPos.z);
	},
};
