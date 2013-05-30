
Ptero.Parallax.Model = function() {
	this.enemySprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
	this.enemyPos = {x:0,y:0,z:Ptero.screen.getFrustum().near*2};
};

Ptero.Parallax.Model.prototype = {
	setMode: function(mode) {
		this.mode = mode;
		$("#btn-position").removeClass("active");
		$("#btn-collision").removeClass("active");
		$("#btn-parallax").removeClass("active");
		$("#toolbar-position").css("display", "none");
		$("#toolbar-collision").css("display", "none");
		$("#toolbar-parallax").css("display", "none");
		$("#btn-"+mode).addClass('active');
		$("#toolbar-"+mode).css('display', 'inherit');
	},
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
