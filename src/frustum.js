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

	this.nearTop = Math.tan(fov/2)*near;
	this.nearRight = this.nearTop * aspect;

	this.nearWidth = this.nearRight * 2;
	this.nearHeight = this.nearTop * 2;
};

Ptero.Frustum.prototype = {
	projectToZ: function(x,y,z,newz) {
		return {
			x: x/z*newz,
			y: y/z*newz,
		};
	},
	projectToNear: function(x,y,z) {
		return this.projectToZ(x,y,z,this.near);
	},
	isInside: function(x,y,z) {
		var v = this.projectToNear(x,y,z);
		return (far < z && z < near && // ( far < z < near)
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function(z,nearScale) {
		return nearScale/z*this.near;
	},
};
