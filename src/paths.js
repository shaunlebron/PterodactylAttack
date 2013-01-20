
Ptero.makeEnemyPath = function makeEnemyPath() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.screen.getFrustum();
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.far;

	// starting depth
	var start = Math.random()*(4*far)+far;

	// start point
	var x0,y0,z0;

	// random screen position range
	var xrange = aspect*size*2;
	var yrange = size;

	// random screen position
	x0 = Math.random()*xrange - xrange/2;
	y0 = Math.random()*yrange - yrange/3;

	// project position to start depth
	x0 = x0/near*start;
	y0 = y0/near*start;
	z0 = start;

	// end point
	var x1,y1,z1;

	// random screen position
	xrange /= 2;
	yrange /= 2;
	x1 = Math.random()*xrange - xrange/2;
	y1 = Math.random()*yrange - yrange/2;
	z1 = near;

	// get distance traveled
	var dx = x1-x0;
	var dy = y1-y0;
	var dz = z1-z0;
	var dist = Math.sqrt(dx*dx+dy*dy+dz*dz);

	// get time to complete
	var speed = (far-near) / 5;
	var time = dist/speed;

	// set path
	return new Ptero.Path(
			[ new Ptero.Vector(x0,y0,z0), new Ptero.Vector(x1,y1,z1) ],
			[ time, time ],
			false); // loop flag
};
