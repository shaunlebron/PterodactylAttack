
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
			sprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
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
		that.times.push(that.times[len-1] + 1.0);
		p.t = that.times[len];
		that.points.push(p);
		var sprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
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
			that.makeDefaultPath(5);
		}
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
								sprite.drawBorder(ctx,pos,"#F00",true);
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
