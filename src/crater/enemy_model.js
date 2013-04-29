Ptero.Crater.EnemyModelList = function() {
	this.models = [];

	// running count of the number of paths created.
	// used as unique ids to newly created paths
	this.index = 0;

	this.time = 0;
	this.maxTime = 0;
	this.selectedTime = undefined;

	this.isEditing = false;
	this.isPaused = false;
};

Ptero.Crater.EnemyModelList.prototype = {
	deselectAll: function() {
		var i,len=this.models.length;
		for (i=0; i<len; i++) {
			this.models[i].selectedIndex = undefined;
		}
	},
	selectSomething: function() {
		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e.selectedIndex == undefined) {
				e.selectedIndex = 0;
			}
		}
	},
	refreshOrder: function() {
		var i,len=this.models.length;
		for (i=0; i<len; i++) {
			this.models[i].order = i;
		}
	},
	refreshMaxTime: function() {
		var i,len=this.models.length;
		this.maxTime = 0;
		for (i=0; i<len; i++) {
			this.maxTime = Math.max(this.maxTime, this.models[i].enemy.path.totalTime);
		}
	},
	setModels: function(models) {

		this.index = 0;
		var i,len=models.length;
		for (i=0; i<len; i++) {
			this.index = Math.max(this.index, models[i].index);
		}

		this.models = models;
		this.select(models[0]);
		this.refreshMaxTime();
		this.refreshOrder();
		this.setTime(0);

		this.isEditing = false;
		this.deselectAll();

		Ptero.Crater.loader.backup();
	},
	createNew: function() {
		this.index++;
		var e = new Ptero.Crater.EnemyModel(this.index);
		this.models.push(e);
		this.select(e);
		this.refreshMaxTime();
		this.refreshOrder();
		Ptero.Crater.loader.backup();
	},
	promptRemoveIndex: function(index) {
		var that = this;
		bootbox.confirm('Are you sure you want to delete "Path '+index+'"?',
			function(result) {
				if (result) {
					that.removeIndex(index);
				}
			}
		);
	},
	previewIndex: function(index) {
		this.active_enemy_model = Ptero.Crater.enemy_model;
		Ptero.Crater.enemy_model = this.getModelFromIndex(index);
	},
	unpreviewIndex: function(index) {
		if (this.active_enemy_model) {
			this.select(this.active_enemy_model);
		}
		this.active_enemy_model = undefined;
	},
	getModelFromIndex: function(index) {
		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e.index == index) {
				return e;
			}
		}
		return null;
	},
	selectIndex: function(index) {
		this.select(this.getModelFromIndex(index));
	},
	select: function(model) {
		this.active_enemy_model = model;
		Ptero.Crater.enemy_model = model;
		this.refreshTabs();
	},
	removeIndex: function(index) {
		this.remove(this.getModelFromIndex(index));
	},
	remove: function(model) {
		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e == model) {
				this.models.splice(i,1);
				if (len == 1) {
					this.createNew();
				}
				else {
					this.select(this.models[0]);
				}
				break;
			}
		}
		this.refreshMaxTime();
		this.refreshOrder();
		Ptero.Crater.loader.backup();
	},
	getTabsString: function() {
		var i,e,len=this.models.length;
		var str = "";
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e == Ptero.Crater.enemy_model) {
				str += '<li class="active"><a href="#">';
			}
			else {
				str += '<li><a href="#" ';
				str += 'onclick="Ptero.Crater.enemy_model_list.selectIndex(' + e.index + ')"';
				str += 'onmouseover="Ptero.Crater.enemy_model_list.previewIndex(' + e.index + ')"';
				str += 'onmouseout="Ptero.Crater.enemy_model_list.unpreviewIndex(' + e.index + ')"';
				str += '>';
			}
			str += '<button class="close" type="button" onclick="Ptero.Crater.enemy_model_list.promptRemoveIndex(' +e.index+ ')">&times;</button>Path ' + e.index + '</a></li>';
		}
		str += '<li><a href="#" onclick="Ptero.Crater.enemy_model_list.createNew()"><i class="icon-plus"></i></li>';
		return str;
	},
	refreshTabs: function() {
		$("#pathtabs").html(this.getTabsString());
		// TODO: recalculate max times
	},
	update: function(dt) {

		if (!this.isEditing && !this.isPaused) {
			this.setTime((this.time + dt) % this.maxTime);
		}

		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			var e = this.models[i];
			e.update(dt);
		}
	},
	setTime: function(t) {
		this.time = t;
		var i,len=this.models.length;
		for (i=0; i<len; i++) {
			this.models[i].enemy.path.setTime(t);
		}
	},
};

Ptero.Crater.EnemyModel = function(index) {
	this.index = index;
	this.enemy = new Ptero.Enemy();
	this.points = [];
	this.delta_times = [];
	this.times = [];
	this.nodeSprites = [];
	this.makeDefaultPath(2);
};

Ptero.Crater.EnemyModel.fromState = function(state) {
	var model = new Ptero.Crater.EnemyModel(state.index);
	model.points = state.points;

	var i,len = model.points.length;
	model.nodeSprites = [];
	model.times = [];
	for (i=0; i<len; i++) {
		model.times[i] = model.points[i].t;
		var sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
		sprite.shuffleTime();
		model.nodeSprites[i] = sprite;
	}

	model.refreshTimes();
	model.refreshPath();

	return model;
};

Ptero.Crater.EnemyModel.prototype = {
	getState: function() {
		return {
			index: this.index,
			points: this.points,
		};
	},
	makeDefaultPath: function(numPoints) {
		var frustum = Ptero.screen.getFrustum();
		var near = frustum.near;
		var far = frustum.far;
		var dist = far-near;
		var i;
		var sprite;
		for (i=0; i<numPoints; i++) {
			this.points[i] = {
				x:0,
				y:0,
				z:far - i/(numPoints-1)*dist,
				angle: 0,
			};
			sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
			sprite.shuffleTime();
			this.nodeSprites[i] = sprite;
		}
		var t = 0;
		for (i=0; i<numPoints; i++) {
			this.times[i] = t;
			t += 3.0;
		}
		this.refreshTimes();
		this.initPath();
	},
	initPath: function() {
		this.interp = this.makeInterp();
		//this.enemy.path = new Ptero.Path(this.interp, true);
		this.enemy.path = new Ptero.Path(this.interp);
		Ptero.Crater.enemy_model_list.refreshMaxTime();

		Ptero.Crater.loader.backup();
	},
	refreshPath: function() {
		this.initPath();
	},
	makeInterp: function() {
		return Ptero.makeHermiteInterpForObjs(
			this.points,
			['x','y','z','angle'],
			this.delta_times
		);
	},
	removePoint: function(index) {
		var len = this.points.length;
		if (index == 0 || !(index > 0 && index < len) || len <= 2) {
			return;
		}
		this.points.splice(index,1);
		this.times.splice(index,1);
		this.nodeSprites.splice(index,1);

		this.selectPoint(index-1);

		this.refreshTimes();
		this.refreshPath();
	},

	removeSelectedPoint: function() {
		this.removePoint(this.selectedIndex);
	},

	addPoint: function() {
		var len = this.points.length;
		var p = Ptero.screen.getFrustum().getRandomPoint();
		p.angle = 0;
		this.times.push(this.times[len-1] + 1.0);
		p.t = this.times[len];
		this.points.push(p);
		var sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
		sprite.shuffleTime();
		this.nodeSprites.push(sprite);

		this.selectPoint(len);

		this.refreshTimes();
		this.refreshPath();
	},

	// Reorder points and compute delta times.
	refreshTimes: function() {
		var prevSelectedPoint = this.getSelectedPoint();

		// We need to sort the points by time, so we attach a 't' variable as a sort key.
		var i,len = this.points.length;
		for (i=0; i<len; i++) {
			this.points[i].t = this.times[i];
		}
		this.points.sort(function(a,b) { return a.t - b.t; });

		// also sort the times.
		this.times.sort(function(a,b) { return a - b; });

		// compute the delta times in the newly sorted list.
		this.delta_times.length = 0;
		this.delta_times[0] = this.times[0];
		for (i=1; i<len; i++) {
			this.delta_times[i] = this.times[i] - this.times[i-1];
		}

		// The selected point may have a different index upon resorting, so find out where it went.
		var selectedPoint = this.getSelectedPoint();
		if (selectedPoint != prevSelectedPoint) {
			for (i=0; i<len;i++) {
				if (this.points[i] == prevSelectedPoint) {
					this.selectedIndex = i;
					break;
				}
			}
		}
	},

	update: function(dt) {
		var isActive = (this == Ptero.Crater.enemy_model);

		// REPLAY MODE
		if (!Ptero.Crater.enemy_model_list.isEditing) {
			//this.enemy.update(dt);

			this.enemy.babySprite.update(dt);

			var that = this;
			if (this.enemy.getPosition()) {
				Ptero.deferredSprites.defer(
					(function(e){
						return function(ctx) {
							if (!isActive) {
								ctx.globalAlpha = 0.5;
							}
							e.draw(ctx);
							if (!isActive) {
								ctx.globalAlpha = 1;
							}
						};
					})(this.enemy),
					this.enemy.getPosition().z);
			}
		}

		// EDIT MODE
		else {

			// DRAW ALL NODES WHEN ACTIVE
			if (isActive) {
				for (i=0; i<this.nodeSprites.length; i++) {
					if (this.selectedIndex == i) {
						this.nodeSprites[i].update(dt);
					}
					Ptero.deferredSprites.defer(
						(function(sprite,pos,isSelected) {
							return function(ctx){
								if (isSelected) {
									sprite.draw(ctx,pos);
									sprite.drawBorder(ctx,pos,"#F00",true);
								}
								else {
									var backupAlpha = ctx.globalAlpha;
									ctx.globalAlpha *= 0.7;
									sprite.draw(ctx,pos);
									ctx.globalAlpha = backupAlpha;
								}
							};
						})(this.nodeSprites[i],this.points[i],this.selectedIndex == i),
						this.points[i].z);
				}
			}

			// WHEN NOT ACTIVE, DRAW SPRITE AT CURRENT TIME
			else {
				this.enemy.babySprite.update(dt);

				var pos = this.enemy.getPosition();
				if (pos) {
					var that = this;
					Ptero.deferredSprites.defer(
						(function(e){
							return function(ctx) {
								ctx.globalAlpha = 0.35;
								e.draw(ctx);
								ctx.globalAlpha = 1;
							};
						})(this.enemy),
						pos.z);
				}
			}
		}
	},
	selectPoint: function(index) {

		// If we have just deselected a point...
		if (index == undefined && this.selectedIndex != undefined) {

			// just aesthetics: match the replay sprite with the editing node sprite
			this.enemy.babySprite.time = this.nodeSprites[this.selectedIndex].time;
		}

		this.selectedIndex = index;

		// Set editing mode depending on whether we are selecting or deselecting.
		Ptero.Crater.enemy_model_list.isEditing = (index != undefined);

		// Set the current time at the selected node.
		if (index != undefined) {
			Ptero.Crater.enemy_model_list.setTime(this.points[this.selectedIndex].t);
			Ptero.Crater.enemy_model_list.selectSomething();
		}
		else {
			Ptero.Crater.enemy_model_list.deselectAll();
		}
	},

	getSelectedPoint: function() {
		return this.points[this.selectedIndex];
	},

	getSelectedNodeSprite: function() {
		return this.nodeSprites[this.selectedIndex];
	},
};
