
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
		var livePane = Ptero.Baklava.panes.getLivePane();
		if (mode == "insert" && this.collisionMode == "create") {
			bootbox.alert("Please finish creating the shape before inserting new points.");
			return;
		}

		if (mode == "insert" && !livePane.selectedPoint) {
			bootbox.alert("Please select an existing point to insert a new point next to.");
			return;
		}

		if ((mode == "create" || mode == "insert") && this.selectedLayer == null) {
			bootbox.alert("Please select a background layer to apply the collision geometry to first!");
			mode = "select";
		}

		this.collisionMode = mode;

		$("#btn-create-shape").removeClass('active');
		$("#btn-insert-point").removeClass('active');

		if (mode == "create") {
			$("#btn-create-shape").addClass('active');
			this.collisionDraft = new Ptero.CollisionShape();
		}
		else if (mode == "select") {
			this.collisionDraft = null;
		}
		else if (mode == "insert") {
			$("#btn-insert-point").addClass('active');
		}
	},

	createShape: function() {
		this.setCollisionMode("create");
	},
	deleteShape: function() {
		bootbox.confirm('Are you sure you want to delete this entire shape?',
			function(result) {
				if (result) {
					var livePane = Ptero.Baklava.panes.getLivePane();
					livePane.removeSelectedShape();
				}
			}
		);
	},
	deletePoint: function() {
		var livePane = Ptero.Baklava.panes.getLivePane();
		livePane.removeSelectedPoint();
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
