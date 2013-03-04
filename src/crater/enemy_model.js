
Ptero.Crater.enemy_model = new function() {

	var that = this;

	this.enemy = null;
	this.points = [];
	this.times = [];

	this.refreshPath = function() {
		that.interp = that.makeInterp();
		that.enemy.path.interp = that.interp;
	};

	this.initPath = function() {
		that.interp = that.makeInterp();
		that.enemy.path = new Ptero.Path(that.interp, true);
	};

	this.makeInterp = function() {
		return Ptero.makeHermiteInterpForObjs(
			that.points,
			['x','y','z'],
			that.times
		);
	};

	this.makeDefaultPath = function(numPoints) {
		var frustum = Ptero.screen.getFrustum();
		var near = frustum.near;
		var far = frustum.far;
		var dist = far-near;
		var i;
		for (i=0; i<numPoints; i++) {
			that.points[i] = {
				x:0,
				y:0,
				z:far - i/(numPoints-1)*dist,
			};
		}
		for (i=0; i<numPoints-1; i++) {
			that.times[i] = 1.0;
		}
		that.initPath();
	};

	this.init = function() {
		that.enemy = new Ptero.Enemy();
		that.enemy.scale = 2.0;
		that.makeDefaultPath(4);
	};

	this.update = function(dt) {
		that.enemy.update(ctx);
	};

	this.draw = function(ctx) {
		that.enemy.draw(ctx);
	};

	this.selectPoint = function(index) {
		that.selectedIndex = index;
	};

	this.getSelectedPoint = function() {
		return that.points[that.selectedIndex];
	};
};
