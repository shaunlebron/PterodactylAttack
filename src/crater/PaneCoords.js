
Ptero.Crater.PaneCoords = function(width, height, axes, dir, unitsPerPixel, left, top) {
	// 2 axes labels (x,y,or z)
	this.axes = axes;

	// direction of each axis (-1 or 1)
	this.dir = dir;

	// units per pixel
	this.unitsPerPixel = unitsPerPixel;

	// coord
	this.left = left;
	this.top = top;

	this.width = width;
	this.height = height;
};

Ptero.Crater.PaneCoords.prototype = {

	// transforms screen coordinates into space coordinates
	forward: function(x,y) {
		var a = x * this.dir[0] * this.unitsPerPixel - this.left;
		var b = y * this.dir[1] * this.unitsPerPixel - this.top;
		return {a:a, b:b};
	},

	// transforms space coordinates to screen coordinates
	inverse: function(a,b) {
		var x = (a + this.left) / this.unitsPerPixel / this.dir[0];
		var y = (b + this.top) / this.unitsPerPixel / this.dir[1];
		return {x:x, y:y};
	},

	// transforms a 3d vector from space coordinates to screen coordinates
	inverseFull: function(vec) {
		var a = vec[this.axes[0]];
		var b = vec[this.axes[1]];
		return inverse(a,b);
	},
};
