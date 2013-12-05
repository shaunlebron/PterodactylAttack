// Viewing Frustum for 3D projection.
// coordinate system is OpenGL with z reversed:
//		 +x = right
//		 +y = up
//		 +z = out (from your eye to the screen)
// fov is vertical field of view.
// near and far planes are in z coordinates.
Ptero.Frustum = function(near,far,fov,aspect) {
	this.near = near;
	this.far = far;
	this.fov = fov;
	this.aspect = aspect;

	this.createBoundingBox();
	this.createEdges();
};

Ptero.Frustum.prototype = {
	projectToZ: function projectToZ(vector,newz) {
		return new Ptero.Vector(
			vector.x/vector.z*newz,
			vector.y/vector.z*newz,
			newz);
	},
	projectToNear: function projectToNear(vector) {
		return this.projectToZ(vector,this.near);
	},
	isInside: function isInside(vector) {
		var v = this.projectToNear(vector);
		return (/*this.far >= vector.z &&*/ vector.z > this.near &&
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function getDepthScale(z,nearScale) {
		return nearScale/z*this.near;
	},
	createBoundingBox: function createBoundingBox() {
		this.nearTop = Math.tan(this.fov/2)*this.near;
		this.nearRight = this.nearTop * this.aspect;
		this.nearBottom = -this.nearTop;
		this.nearLeft = -this.nearRight;
		this.nearWidth = this.nearRight * 2;
		this.nearHeight = this.nearTop * 2;

		this.farTop = Math.tan(this.fov/2)*this.far;
		this.farRight = this.farTop * this.aspect;
		this.farBottom = -this.farTop;
		this.farLeft = -this.farRight;
		this.farWidth = this.farRight * 2;
		this.farHeight = this.farTop * 2;

		this.xmin = this.farLeft;
		this.xmax = this.farRight;
		this.ymin = this.farBottom;
		this.ymax = this.farTop;
		this.zmin = this.near;
		this.zmax = this.far;

		this.xrange = this.xmax-this.xmin;
		this.yrange = this.ymax-this.ymin;
		this.zrange = this.zmax-this.zmin;

		this.xcenter = this.xmin + this.xrange/2;
		this.ycenter = this.ymin + this.yrange/2;
		this.zcenter = this.zmin + this.zrange/2;

	},
	createEdges: function createEdges() {
		n = this.near;
		f = this.far;
		nl = this.nearLeft;
		nr = this.nearRight;
		nt = this.nearTop;
		nb = this.nearBottom;
		fl = this.farLeft;
		fr = this.farRight;
		ft = this.farTop;
		fb = this.farBottom;

		this.edges = [
			[{x:nl, y:nt, z:n}, {x:nr, y:nt, z:n}, {x:nr, y:nb, z:n}, {x:nl, y:nb, z:n}], // near edges
			[{x:fl, y:ft, z:f}, {x:fr, y:ft, z:f}, {x:fr, y:fb, z:f}, {x:fl, y:fb, z:f}], // far edges
			[{x:nl, y:nt, z:n}, {x:fl, y:ft, z:f}], // top left edge
			[{x:nr, y:nt, z:n}, {x:fr, y:ft, z:f}], // top right edge
			[{x:nr, y:nb, z:n}, {x:fr, y:fb, z:f}], // bottom right edge
			[{x:nl, y:nb, z:n}, {x:fl, y:fb, z:f}], // top left edge
		];
	},
	getRandomPoint: function() {
		var x = Math.random() * this.xrange + this.xmin;
		var y = Math.random() * this.yrange + this.ymin;
		var z = Math.random() * this.zrange + this.zmin;
		return this.projectToZ({x:x,y:y,z:this.far},z);
	},
};
