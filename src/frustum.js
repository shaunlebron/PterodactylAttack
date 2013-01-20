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
		return (this.far < vector.z && vector.z < this.near && // ( far < z < near)
				Math.abs(v.x) < this.nearRight &&
				Math.abs(v.y) < this.nearTop);
	},
	getDepthScale: function getDepthScale(z,nearScale) {
		return nearScale/z*this.near;
	},
};
