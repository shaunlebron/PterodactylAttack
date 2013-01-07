Ptero.orb = (function(){

	// radius of the orb on screen and in space
	function getRadius() {
		return Ptero.screen.getHeight()/2 * (1/2*0.8);
	}
	function getSpaceRadius() {
		return getRadius() / Ptero.screen.getScreenToSpaceRatio();
	}

	// charging object
	var charge = (function(){
		var on = false;
		var maxTime = 7;
		var time = 0;

		var update = function(dt) {
			if (on) {
				time = Math.min(time+dt, maxTime);
			}
		};

		var draw = function(ctx,pos) {
			ctx.fillStyle = "rgba(255,0,0,0.5)";
			var s;
			if (time == maxTime) {
				s = 1;
			}
			else {
				s = time/maxTime*(1 + Math.cos(20*time)*0.05);
			}
			ctx.beginPath();
			ctx.arc(pos.x,pos.y,s*getRadius(), 0, 2*Math.PI);
			ctx.fill();
		};

		var reset = function() {
			on = false;
			time = 0;
		};

		var start = function() {
			on = true;
			time = 0;
		};
		
		return {
			start: start,
			reset: reset,
			update: update,
			draw: draw,
			isOn: function() { return on; },
		};
	})();

	// origin of the orb with next transition point
	var origin;
	var next_origin;
	var setOrigin,setNextOrigin;
	(function(){
		var convertFracToAbs = function(xfrac, yfrac) {
			var frustum = Ptero.screen.getFrustum();
			return new Ptero.Vector(
					xfrac * frustum.nearRight,
					yfrac * frustum.nearTop,
					frustum.near);
		};
		setNextOrigin = function(xfrac, yfrac) {
			next_origin = convertFracToAbs(xfrac,yfrac);
		};
		setOrigin = function(xfrac, yfrac) {
			origin = convertFracToAbs(xfrac,yfrac);
		};
	})();

	// bullet speed
	var v = 50;
	var direction;

	// the orb's targets.
	var targets;

	var init = function() {
		charge.reset();
		setOrigin(0,-2);
		enableTouch();
	};

	var update = function(dt) {
		origin.ease_to(next_origin, 0.1);
		Ptero.bulletpool.update(dt);
		charge.update(dt);
	};

	var draw = function(ctx) {
		var radius = getRadius();
		var p = Ptero.screen.spaceToScreen(origin);

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(p.x,p.y,radius, 0, 2*Math.PI);
		ctx.fill();
		charge.draw(ctx,p);
	};

	var tryShoot = function(vector) {

		var getRelNormVector = function(vector) {
			return (new Ptero.Vector).set(vector).sub(origin).normalize();
		};

		var shoot_vec = getRelNormVector(vector);

		// find visible cube nearest to our line of trajectory
		var angle = 30*Math.PI/180;
		var index = -1;
		var i,len;
		var frustum = Ptero.screen.getFrustum();
		for (i=0,len=targets.length; targets && i<len; ++i) {
			if (!targets[i].isHittable()) {
				continue;
			}

			// skip if not visible
			var target_pos = targets[i].getPosition();
			if (!frustum.isInside(target_pos)) {
				continue;
			}

			// calculate near-plane normalized vector
			var target_proj = frustum.projectToNear(target_pos);
			var target_vec = getRelNormVector(target_proj);
			var target_angle = target_vec.angle(shoot_vec);

			// update closest
			if (target_angle < angle) {
				angle = target_angle;
				index = i;
			}
		}

		// dry fire
		if (index == -1) {
			aimRadius = 0.75f;
			aimPlane = -46f;
			shootDry(x,y);
			return;
		}

		// compute aiming bounds and get collision time
		var t = constrictAim(targets[index]);

		if (t < 0) {
			return;
		}

		// fire the bullet
		shoot(x,y,t,targets[index]);
	};

	var setTargets = function(_targets) {
		targets = _targets;
	};

	var touchHandler = (function(){
		var isInside = function(vector) {
			var r = getSpaceRadius();
			return vector.dist_sq(origin) <= r*r;
		};
		var start = function(vector) {
			if (isInside(vector)) {
				charge.start();
			}
		};
		var move = function(vector) {
			if (charge.on && !isInside(vector)) {
				tryShoot(vector);
				charge.stop();
			}
		};
		var end = function() {
			charge.stop();
		};
		var cancel = function() {
			charge.stop();
		};

		// convert the incoming xy coords from screen to space.
		var wrapFunc = function(f) {
			return function(x,y) {
				var vector = Ptero.screen.screenToSpace({x:x,y:y});
				f(vector);
			};
		};
		return {
			start: wrapFunc(start),
			move: wrapFunc(move),
			end: wrapFunc(end),
			cancel: wrapFunc(cancel),
		};
	})();
	var enableTouch = function() {
		Ptero.input.addTouchHandler(touchHandler);
	};
	var disableTouch = function() {
		Ptero.input.removeTouchHandler(touchHandler);
	};

	return {
		init: init,
		draw: draw,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
	};
})();

//	public Orb()
//	{
//		bullets = new BulletPool();
//		setOrigin(0,0);
//	}
//
//	// x,y are screen coordinates
//	// This function is called as soon as the touched screen coordinate is outside the orb
//	private void tryShoot(float x, float y)
//	{
//		// convert to relative vector
//		x = x - ox;
//		y = y - oy;
//
//		// normalize vector
//		float dist = (float)Math.sqrt(x*x+y*y);
//		x /= dist;
//		y /= dist;
//
//		// find visible cube nearest to our line of trajectory
//		float angle = 30*(float)Math.PI/180;
//		int index = -1;
//		for (int i=0; i<targets.length; ++i)
//		{
//			Vector3 p = targets[i].getPosition();
//			Vector2 p2 = Screen.projectToNear(p);
//
//			if (!targets[i].isHittable()) {
//				continue;
//			}
//
//			// skip if not visible
//			if (!Screen.isVisible(p))
//				continue;
//
//			// calculate near-plane normalized vector
//			float dx = p2.x-ox;
//			float dy = p2.y-oy;
//			dist = (float)Math.sqrt(dx*dx+dy*dy);
//			dx/=dist;
//			dy/=dist;
//
//			// calculate angle between this cube and the line of trajectory
//			float a = (float)Math.abs(Math.acos(dx*x+dy*y));
//
//			// update closest
//			if (a < angle)
//			{
//				angle = a;
//				index = i;
//			}
//		}
//
//		// dry fire
//		if (index == -1)
//		{
//			aimRadius = 0.75f;
//			aimPlane = -46f;
//			shootDry(x,y);
//			return;
//		}
//
//		// compute aiming bounds and get collision time
//		float t = constrictAim(targets[index]);
//
//		if (t < 0) {
//			return;
//		}
//
//		// fire the bullet
//		shoot(x,y,t,targets[index]);
//	}
//
//	private void shootDry(float x, float y)
//	{
//		// compute screen position of the bullet when colliding with aimPlane
//		float bx = ox + x*aimRadius;
//		float by = oy + y*aimRadius;
//
//		// project back to the actual 3D collision plane
//		float bz = aimPlane;
//		bx = bx / -Screen.near * bz;
//		by = by / -Screen.near * bz;
//
//		// aim at the point of collision
//		aimAt(bx,by,bz);
//		//System.out.printf("Miss: not shooting at anything\n");
//		//System.out.printf("Radius: %f, Plane: %f\n", aimRadius, aimPlane);
//		bullets.add(new Bullet(ox,oy,oz,xv,yv,zv,v,chargeTime/maxChargeTime,3.0f,null));
//	}
//
//	private void shoot(float x, float y, float t, Target target)
//	{
//		// -------------------------------------------------
//		// Compute aim given the pre-computed constraints
//		// -------------------------------------------------
//
//		// compute screen position of the bullet when colliding with aimPlane
//		float bx = ox + x*aimRadius;
//		float by = oy + y*aimRadius;
//
//		// project back to the actual 3D collision plane
//		float bz = aimPlane;
//		bx = bx / -Screen.near * bz;
//		by = by / -Screen.near * bz;
//
//		// aim at the point of collision
//		aimAt(bx,by,bz);
//
//		// -------------------------------------------------
//		// Determine if the bullet will hit the cube
//		// -------------------------------------------------
//
//		// compute position of the cube at predicted collision time
//		Vector3 p = target.getFuturePosition(t);
//
//		// compute the distance between the bullet and the cube
//		float dx = bx-p.x;
//		float dy = by-p.y;
//		float dz = bz-p.z;
//		float dist = (float)Math.sqrt(dx*dx+dy*dy+dz*dz);
//
//		// fire the bullet
//		//float maxdist = Screen.getNearTop()*2; // TODO: actually understand this empirical amount
//		float maxdist = target.getCollisionRadius();
//		if (dist < maxdist) {
//			// set bullet to collide
//			//System.out.printf("Hit: bullet comes within %f < %f\n", dist, maxdist);
//			//System.out.printf("Radius: %f, Plane: %f\n", aimRadius, aimPlane);
//			bullets.add(new Bullet(ox,oy,oz,xv,yv,zv,v,chargeTime/maxChargeTime,t,target));
//		}
//		else {
//			// set bullet to NOT collide
//			//System.out.printf("Miss: bullet comes within %f > %f\n", dist, maxdist);
//			//System.out.printf("Radius: %f, Plane: %f\n", aimRadius, aimPlane);
//			bullets.add(new Bullet(ox,oy,oz,xv,yv,zv,v,chargeTime/maxChargeTime,t,null));
//		}
//
//	}
//
//	float aimPlane;
//	float aimRadius;
//
//	private float constrictAim(Target target)
//	{
//		float t;
//		float dt = 1f/100;
//
//		float dist = Float.MAX_VALUE;
//		float tol = 0.4f;
//
//		// do a simple linear search through time
//		float bx=0,by=0,bz=0; // bullet position
//		for (t=0; dist > tol && t < 6; t += dt)
//		{
//			// get position of cube in t seconds
//			Vector3 p = target.getFuturePosition(t);
//
//			// get position of bullet in t seconds if aimed at cube's predicted position
//			aimAt(p.x,p.y,p.z);
//			bx = ox+xv*t*v;
//			by = oy+yv*t*v;
//			bz = oz+zv*t*v;
//
//			float dx = bx-p.x;
//			float dy = by-p.y;
//			float dz = bz-p.z;
//			dist = (float)Math.sqrt(dx*dx+dy*dy+dz*dz);
//		}
//
//		if (dist > tol)
//		{
//			//System.out.printf("couldn't fire closer than %f units from the cube\n", dist);
//			return -1;
//		}
//		else
//		{
//			aimPlane = bz;
//
//			float dx = bx / bz * -Screen.near - ox;
//			float dy = by / bz * -Screen.near - oy;
//			aimRadius = (float)Math.sqrt(dx*dx+dy*dy);
//
//			return t;
//		}
//	}
//
//	private void aimAt(float x0, float y0, float z0)
//	{
//		xv = x0-ox;
//		yv = y0-oy;
//		zv = z0-oz;
//		float dist = (float)Math.sqrt(xv*xv+yv*yv+zv*zv);
//		xv/=dist;
//		yv/=dist;
//		zv/=dist;
//	}
//
//	private boolean contains(float x, float y)
//	{
//		float r = getRadius();
//		float dx = ox - x;
//		float dy = oy - y;
//		float dist = (float)Math.sqrt(dx*dx+dy*dy);
//		return dist < r;
//	}
//
//	public void render(GL10 gl)
//	{
//		gl.glBindTexture(GL10.GL_TEXTURE_2D, 0);
//		gl.glPushMatrix();
//		gl.glTranslatef(ox,oy, 0);
//
//		float s = getRadius();
//		gl.glScalef(s,s,1);
//		circle.render(GL10.GL_TRIANGLE_FAN);
//
//		if (chargeTime == maxChargeTime)
//			s = 1;
//		else
//			s = chargeTime/maxChargeTime*(1 + (float)Math.cos(20*chargeTime)*0.05f);
//		gl.glScalef(s,s,1);
//		gl.glTranslatef(0f,0f,0.1f);
//		circleRed.render(GL10.GL_TRIANGLE_FAN);
//
//		gl.glPopMatrix();
//	}
//
//	private float getRadius()
//	{
//		return Screen.getNearTop()*rAspect;
//	}
//
//
//}
//
