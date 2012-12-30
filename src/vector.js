
Ptero.Vector = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
};

Ptero.Vector.prototype = {
	set: function(vector) {
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;
		return this;
	},
	add: function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		return this;
	},
	sub: function(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		return this;
	},
	mul: function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	},
};
