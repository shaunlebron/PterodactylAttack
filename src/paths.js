
Ptero.makeLinearEnemyPath = function() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.frustum;
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.far;

	var xrange = aspect*size*2;
	var yrange = size;

	var startPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/3,
		near);
	var startZ = Math.random()*(4*far)+far;
	startPos = frustum.projectToZ(startPos, startZ);

	// random screen position
	xrange /= 2;
	yrange /= 2;
	
	var endPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/2,
		near);

	var dist = startPos.dist(endPos);
	var speed = (far-near) / 5;
	var time = dist/speed;

	var interp = Ptero.makeInterpForObjs('linear', 
		[ startPos, endPos ],
		['x','y','z'],
		[0,time]);

	return new Ptero.Path(interp);
};

Ptero.makeHermiteEnemyPath = function() {

	// frustum attributes
	var aspect = Ptero.screen.getAspect();
	var frustum = Ptero.frustum;
	var size = Ptero.sizeFactor;
	var near = frustum.near;
	var far = frustum.near * 8;

	var xrange = aspect*size*2;
	var yrange = size;

	var startPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange + size,
		near);
	var startZ = Math.random()*(4*far)+far;
	startPos = frustum.projectToZ(startPos, startZ);

	var midPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange,
		near);
	var midZ = near + (near + far)*0.75;
	midPos = frustum.projectToZ(midPos, midZ);

	xrange /= 2;
	yrange /= 2;
	var endPos = new Ptero.Vector(
		Math.random()*xrange - xrange/2,
		Math.random()*yrange - yrange/2,
		near);
	var endZ = near;
	endPos = frustum.projectToZ(endPos, endZ);

	// create random angles
	function randAngle() {
		var a = 50*Math.PI/180;
		return Math.random()*2*a - a;
	}
	startPos.angle = randAngle();
	midPos.angle = randAngle();
	endPos.angle = randAngle();

	// create interpolation on a time scale of 1 second
	var interp = Ptero.makeHermiteInterpForObjs(
		[ startPos, midPos, endPos ],
		['x','y','z','angle'],
		[0,0.5, 0.5]);

	// approximate distance of the interpolated path
	var t,dist = 0;
	var pos,prevPos;
	for (t=0; t<=1; t+=(1/1000)) {
		pos = (new Ptero.Vector).set(interp(t));
		if (prevPos) {
			dist += prevPos.dist(pos);
		}
		prevPos = pos;
	}

	// compute time to complete path
	var speed = (far-near) / 5;
	var time = dist/speed;

	// create interpolation on the desired time scale
	interp = Ptero.makeHermiteInterpForObjs(
		[ startPos, midPos, endPos ],
		['x','y','z','angle'],
		[0,time/2, time/2]);

	return new Ptero.Path(interp);
};
