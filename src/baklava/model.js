
Ptero.Baklava.Model = function() {
	this.enemySprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
	this.enemyPos = {x:0,y:0,z:Ptero.screen.getFrustum().near*2};

	this.collisionDraft = null;
	this.setCollisionMode("select");
};

Ptero.Baklava.Model.prototype = {
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

	setCollisionMode: function(mode) {
		if (mode == "create" && Ptero.background.getSelectedLayer() == null) {
			bootbox.alert("Please select a background layer to apply the collision geometry to first!");
			mode = "select";
		}
		this.collisionMode = mode;

		if (mode == "create") {
			$("#btn-create-shape").addClass('active');
			this.collisionDraft = new Ptero.CollisionShape();
		}
		else {
			$("#btn-create-shape").removeClass('active');
			this.collisionDraft = null;
		}
	},

	createShape: function() {
		this.setCollisionMode("create");
	},
	deletePoint: function() {
	},
	insertPoint: function() {
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
		if (this.mode == "position") {
			this.enemySprite.update(dt);
			var pos = this.enemyPos;
			var sprite = this.enemySprite;
			Ptero.deferredSprites.defer(function(ctx) {
				sprite.draw(ctx,pos);
			}, this.enemyPos.z);
		}
	},
};
