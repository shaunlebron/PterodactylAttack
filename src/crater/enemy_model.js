
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
			['x','y','z'],
			that.delta_times
		);
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
			};
			sprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
			sprite.shuffleTime();
			that.nodeSprites[i] = sprite;
		}
		var t = 0;
		for (i=0; i<numPoints; i++) {
			that.times[i] = t;
			t += 1.0;
		}
		that.refreshTimes();
		that.initPath();
	};

	// Reorder points and compute delta times.
	this.refreshTimes = function() {
		var i,len = that.points.length;
		for (i=0; i<len; i++) {
			that.points[i].t = that.times[i];
		}
		that.points.sort(function(a,b) { return a.t - b.t; });
		that.times.sort();

		that.delta_times = [];
		for (i=1; i<len; i++) {
			that.delta_times[i-1] = that.times[i] - that.times[i-1];
		}
	};

	this.init = function() {
		that.enemy = new Ptero.Enemy();
		that.enemy.scale = 2.0;
		that.makeDefaultPath(4);
	};

	this.update = function(dt) {
		if (that.selectedIndex == null) {
			that.enemy.update(dt);
			Ptero.deferredSprites.defer(
				(function(e){
					return function(ctx) {
						e.draw(ctx);
					};
				})(that.enemy),
				that.enemy.getPosition().z);
		}
		else {
			for (i=0; i<that.nodeSprites.length; i++) {
				if (that.selectedIndex == i) {
					that.nodeSprites[i].update(dt);
				}
				Ptero.deferredSprites.defer(
					(function(sprite,pos,isSelected) {
						return function(ctx){
							if (isSelected) {
								sprite.draw(ctx,pos);
								sprite.drawBorder(ctx,pos,"#F00");
							}
							else {
								var backupAlpha = ctx.globalAlpha;
								ctx.globalAlpha = 0.7;
								sprite.draw(ctx,pos);
								ctx.globalAlpha = backupAlpha;
							}
						};
					})(that.nodeSprites[i],that.points[i],that.selectedIndex == i),
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
		that.selectedIndex = index;
	};

	this.getSelectedPoint = function() {
		return that.points[that.selectedIndex];
	};

	this.getSelectedNodeSprite = function() {
		return that.nodeSprites[that.selectedIndex];
	};
};
