Ptero.Crater.EnemyModelList = function() {
	this.models = [];
	this.index = 0;
};

Ptero.Crater.EnemyModelList.prototype = {
	createNew: function() {
		this.index++;
		var e = new Ptero.Crater.EnemyModel(this.index);
		this.models.push(e);
		this.select(e);
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
	selectIndex: function(index) {
		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e.index == index) {
				this.select(e);
				break;
			}
		}
	},
	select: function(model) {
		Ptero.Crater.enemy_model = model;
		this.refreshTabs();
	},
	removeIndex: function(index) {
		var i,len=this.models.length;
		var e;
		for (i=0; i<len; i++) {
			e = this.models[i];
			if (e.index == index) {
				this.remove(e);
				break;
			}
		}
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
				str += '<li><a href="#" onclick="Ptero.Crater.enemy_model_list.selectIndex(' + e.index + ')">';
			}
			str += '<button class="close" type="button" onclick="Ptero.Crater.enemy_model_list.promptRemoveIndex(' +e.index+ ')">&times;</button>Path ' + e.index + '</a></li>';
		}
		str += '<li><a href="#" onclick="Ptero.Crater.enemy_model_list.createNew()"><i class="icon-plus"></i></li>';
		return str;
	},
	refreshTabs: function() {
		$("#pathtabs").html(this.getTabsString());
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

Ptero.Crater.EnemyModel.prototype = {
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
		this.enemy.path = new Ptero.Path(this.interp, true);
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
		this.times.sort();

		// compute the delta times in the newly sorted list.
		this.delta_times = [];
		for (i=1; i<len; i++) {
			this.delta_times[i-1] = this.times[i] - this.times[i-1];
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
		var isActive = this == Ptero.Crater.enemy_model;
		if (this.selectedIndex == null) {
			this.enemy.update(dt);
			var that = this;
			Ptero.deferredSprites.defer(
				(function(e){
					return function(ctx) {
						if (!isActive) {
							ctx.globalAlpha = 0.35;
						}
						e.draw(ctx);
						if (!isActive) {
							ctx.globalAlpha = 1;
						}
					};
				})(this.enemy),
				this.enemy.getPosition().z);
		}
		else {
			for (i=0; i<this.nodeSprites.length; i++) {
				if (this.selectedIndex == i) {
					this.nodeSprites[i].update(dt);
				}
				Ptero.deferredSprites.defer(
					(function(sprite,pos,isSelected) {
						return function(ctx){
							if (!isActive) {
								ctx.globalAlpha = 0.35;
							}
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
							if (!isActive) {
								ctx.globalAlpha = 1;
							}
						};
					})(this.nodeSprites[i],this.points[i],this.selectedIndex == i),
					this.points[i].z);
			}
		}
	},
	draw: function(ctx) {
		if (this.selectedIndex != null) {
			ctx.fillStyle = "rgba(255,255,255,0.8)";
			ctx.fillRect(0,0,Ptero.screen.getWidth(),Ptero.screen.getHeight());
		}
	},
	selectPoint: function(index) {
		// If we have deselected a point, then make sure the animation
		// starts at said point.
		if (index == undefined && this.selectedIndex != undefined) {
			this.enemy.path.time = this.points[this.selectedIndex].t;
			this.enemy.babySprite.time = this.nodeSprites[this.selectedIndex].time;
		}
		this.selectedIndex = index;
	},

	getSelectedPoint: function() {
		return this.points[this.selectedIndex];
	},

	getSelectedNodeSprite: function() {
		return this.nodeSprites[this.selectedIndex];
	},
};

/*
Ptero.Crater.enemy_model = new function() {

	var that = this;

	this.enemy = null;
	this.points = [];
	this.delta_times = [];
	this.times = [];

	this.nodeSprites = [];

	this.refreshPath = function() {
		//that.interp = that.makeInterp();
		//that.enemy.path.interp = that.interp;
		that.initPath();
	};

	this.initPath = function() {
		that.interp = that.makeInterp();
		that.enemy.path = new Ptero.Path(that.interp, true);
	};

	this.makeInterp = function() {
		return Ptero.makeHermiteInterpForObjs(
			that.points,
			['x','y','z','angle'],
			that.delta_times
		);
	};

	this.makeDrunkPath = function() {
		that.points = [{x:0, y:1.568, z:4.968, angle:0, t:0}, {x:0.4657957308104658, y:0.45696529386929846, z:3.6986666666666674, angle:3.0323682713097586, t:1}, {x:0.9421658595279333, y:0.013190245579409409, z:2.4613333333333336, angle:-2.041096203558521, t:2}, {x:-0.7880350551730984, y:-0.049967165404555786, z:1.192, angle:3.036493463448331, t:3}]
		
		var i,len=that.points.length;
		for (i=0; i<len; i++) {
			that.times[i] = that.points[i].t;
			sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
			sprite.shuffleTime();
			that.nodeSprites[i] = sprite;
		}
		that.refreshTimes();
		that.refreshPath();
	};

	this.makeDefaultPath = function(numPoints) {
		var frustum = Ptero.screen.getFrustum();
		var near = frustum.near;
		var far = frustum.far;
		var dist = far-near;
		var i;
		var sprite;
		for (i=0; i<numPoints; i++) {
			that.points[i] = {
				x:0,
				y:0,
				z:far - i/(numPoints-1)*dist,
				angle: 0,
			};
			sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
			sprite.shuffleTime();
			that.nodeSprites[i] = sprite;
		}
		var t = 0;
		for (i=0; i<numPoints; i++) {
			that.times[i] = t;
			t += 3.0;
		}
		that.refreshTimes();
		that.initPath();
	};

	this.removePoint = function(index) {
		var len = that.points.length;

		if (index == 0 || !(index > 0 && index < len) || len <= 2) {
			return;
		}

		that.points.splice(index,1);
		that.times.splice(index,1);
		that.nodeSprites.splice(index,1);

		that.selectPoint(index-1);

		that.refreshTimes();
		that.refreshPath();
	};

	this.removeSelectedPoint = function() {
		that.removePoint(that.selectedIndex);
	};

	this.addPoint = function() {
		var len = that.points.length;
		var p = Ptero.screen.getFrustum().getRandomPoint();
		p.angle = 0;
		that.times.push(that.times[len-1] + 1.0);
		p.t = that.times[len];
		that.points.push(p);
		var sprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
		sprite.shuffleTime();
		that.nodeSprites.push(sprite);

		that.selectPoint(len);

		that.refreshTimes();
		that.refreshPath();
	};

	// Reorder points and compute delta times.
	this.refreshTimes = function() {
		var prevSelectedPoint = that.getSelectedPoint();

		// We need to sort the points by time, so we attach a 't' variable as a sort key.
		var i,len = that.points.length;
		for (i=0; i<len; i++) {
			that.points[i].t = that.times[i];
		}
		that.points.sort(function(a,b) { return a.t - b.t; });

		// also sort the times.
		that.times.sort();

		// compute the delta times in the newly sorted list.
		that.delta_times = [];
		for (i=1; i<len; i++) {
			that.delta_times[i-1] = that.times[i] - that.times[i-1];
		}

		// The selected point may have a different index upon resorting, so find out where it went.
		var selectedPoint = that.getSelectedPoint();
		if (selectedPoint != prevSelectedPoint) {
			for (i=0; i<len;i++) {
				if (that.points[i] == prevSelectedPoint) {
					that.selectedIndex = i;
					break;
				}
			}
		}
	};

	this.init = function() {
		that.enemy = new Ptero.Enemy();
		if (window.location.hash == "#drunk") {
			that.makeDrunkPath();
		}
		else {
			that.makeDefaultPath(2);
		}
	};

	this.update = function(dt) {
		if (that.selectedindex == null) {
			that.enemy.update(dt);
			ptero.deferredsprites.defer(
				(function(e){
					return function(ctx) {
						e.draw(ctx);
					};
				})(that.enemy),
				that.enemy.getposition().z);
		}
		else {
			for (i=0; i<that.nodesprites.length; i++) {
				if (that.selectedindex == i) {
					that.nodesprites[i].update(dt);
				}
				ptero.deferredsprites.defer(
					(function(sprite,pos,isselected) {
						return function(ctx){
							if (isselected) {
								sprite.draw(ctx,pos);
								sprite.drawborder(ctx,pos,"#f00",true);
							}
							else {
								var backupalpha = ctx.globalalpha;
								ctx.globalalpha = 0.7;
								sprite.draw(ctx,pos);
								ctx.globalalpha = backupalpha;
							}
						};
					})(that.nodesprites[i],that.points[i],that.selectedindex == i),
					that.points[i].z);
			}
		}
	};

	this.draw = function(ctx) {
		if (that.selectedIndex != null) {
			ctx.fillStyle = "rgba(255,255,255,0.8)";
			ctx.fillRect(0,0,Ptero.screen.getWidth(),Ptero.screen.getHeight());
		}
	};

	this.selectPoint = function(index) {

		// If we have deselected a point, then make sure the animation
		// starts at said point.
		if (index == undefined && that.selectedIndex != undefined) {
			that.enemy.path.time = that.points[that.selectedIndex].t;
			that.enemy.babySprite.time = that.nodeSprites[that.selectedIndex].time;
		}
		that.selectedIndex = index;
	};

	this.getSelectedPoint = function() {
		return that.points[that.selectedIndex];
	};

	this.getSelectedNodeSprite = function() {
		return that.nodeSprites[that.selectedIndex];
	};
};
*/
