
Ptero.Baklava.Model = function() {
	this.adultSprite = Ptero.assets.makeAnimSprite('adult');
	this.enemySprite = Ptero.assets.makeAnimSprite('baby');
	this.enemyPos = {x:0,y:0,z:Ptero.frustum.near*2};
};

Ptero.Baklava.Model.prototype = {
	reset: function() {
		this.collisionDraft = null;
		this.setCollisionMode("select");
		this.selectedLayer = null;
	},
	setBackground: function(bg) {
		var that = this;
		bootbox.confirm('Are you sure you want to switch backgrounds?  All unsaved data will be lost.',
			function(result) {
				if (result) {
					Ptero.setBackground(bg);
					Ptero.background.loadLayersData();
					that.reset();
				}
			}
		);
	},
	setMode: function(mode) {

		this.mode = mode;
		$("#btn-position").removeClass("active");
		$("#btn-collision").removeClass("active");
		$("#btn-parallax").removeClass("active");
		$("#btn-anim").removeClass("active");

		$("#toolbar-position").css("display", "none");
		$("#toolbar-collision").css("display", "none");
		$("#toolbar-parallax").css("display", "none");
		$("#toolbar-anim").css("display", "none");

		$("#btn-"+mode).addClass('active');
		$("#toolbar-"+mode).css('display', 'inherit');

		if (mode == 'collision') {
			this.collisionMode = 'select';
		}
		else if (mode == 'anim') {
			this.refreshLayerAnimDisplay();
			this.setAnimMode('b');
		}
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
	setAnimMode: function(mode) {
		this.animMode = mode;

		$("#anim-mode-a").removeClass('active');
		$("#anim-mode-b").removeClass('active');
		$("#anim-mode-play").removeClass('active');

		if (mode == 'a') {
			Ptero.background.setAnimating(false);
			$("#anim-mode-a").addClass('active');
		}
		else if (mode == 'b') {
			Ptero.background.setAnimating(false);
			$("#anim-mode-b").addClass('active');
		}
		else if (mode == 'play') {
			Ptero.background.loadLayersData();
			Ptero.background.init();
			Ptero.background.setAnimating(true);
			$("#anim-mode-play").addClass('active');
		}
		else if (mode == 'track') {
			Ptero.background.setAnimating(false);
		}
	},
	setLayerAnimType: function(type) {
		var layer = this.selectedLayer;
		var anim;
		if (layer != null) {
			anim = Ptero.background.layersData[layer].anim;
			anim.type = type;
			if (anim.time == 0) {
				anim.time = 2;
			}
		}
		this.refreshLayerAnimDisplay();
	},
	refreshLayerAnimDisplay: function() {
		var data = Ptero.background.layersData[this.selectedLayer];
		if (data != null) {
			$("#anim-type-dropdown").css("visibility", "visible");
			$("#anim-type-label").html(data.anim.type);
			if (data.anim.type == "intro") {
				$("#anim-idle-time").css("visibility", "hidden");
			}
			else {
				$("#anim-idle-time").css("visibility", "visible");
				$("#anim-idle-time-label").html(data.anim.time+"s");
			}
		}
		else {
			$("#anim-type-dropdown").css("visibility", "hidden");
			$("#anim-idle-time").css("visibility", "hidden");
		}
	},
	setAnimTrack: function(val) {
		var bg = Ptero.background;
		var i,len = bg.layers.length;
		var vals,x0,x1;
		for (i=0; i<len; i++) {
			vals = bg.layersData[i].anim.values;
			x0 = vals[0];
			x1 = vals[1];
			bg.layers[i].setX(x0 + (x1-x0) * val);
		}
	},
	promptLayerIdleTime: function() {
		var data = Ptero.background.layersData[this.selectedLayer];
		if (data) {
			var that = this;
			bootbox.prompt("Set layer idle time loop duration:", "Cancel", "OK", function(result) {
				if (result) {
					data.anim.time = parseInt(result);
					that.refreshLayerAnimDisplay();
					Ptero.background.loadLayersData();
					Ptero.background.init();
					Ptero.background.goToIdle();
				}
			}, data.anim.time);
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
		this.refreshLayerAnimDisplay();
	},
	update: function(dt) {
		if (this.mode == "position") {
			if (this.selectedLayer != null) {
				this.enemySprite.update(dt);
				this.adultSprite.update(dt);
				var pos = this.enemyPos;
				var sprite = this.enemySprite;
				var sprite2 = this.adultSprite;
				Ptero.deferredSprites.defer(function(ctx) {
					sprite2.draw(ctx,pos);
					sprite.draw(ctx,pos);
				}, this.enemyPos.z);
			}
		}
		else if (this.mode == "anim") {
			if (this.animMode == "a") {
				this.setAnimTrack(0);
			}
			else if (this.animMode == "b") {
				this.setAnimTrack(1);
			}
		}
	},
};
