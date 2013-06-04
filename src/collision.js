
Ptero.CollisionShape = function() {
	this.isComplete = false;
	this.points = [];
	this.selectedIndex = null;
};

Ptero.CollisionShape.fromState = function(state) {
	var shape = new Ptero.CollisionShape();
	shape.isComplete = true;
	shape.points = state.points;
	return shape;
};

Ptero.CollisionShape.prototype = {
	getState: function() {
		return {
			points: this.points
		};
	},

	projectToZ: function(z) {
		var i,len=this.points.length;
		var frustum = Ptero.screen.getFrustum();
		for (i=0; i<len; i++) {
			this.points[i] = frustum.projectToZ(this.points[i], z);
		}
	},

	// from: https://github.com/substack/point-in-polygon/blob/master/index.js
	isPointInside: function(x,y) {
		var vs = this.points;
		var inside = false;
		var len = vs.length;
		for (var i = 0, j = len - 1; i < len; j = i++) {
			var xi = vs[i].x, yi = vs[i].y;
			var xj = vs[j].x, yj = vs[j].y;
			
			var intersect = ((yi > y) != (yj > y))
				&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
			if (intersect) inside = !inside;
		}
		return inside;
	},

};
