Ptero.orb = (function(){
	
	// A note about coordinate systems:
	// Screen coordinates are usual pixel coordinates: topleft (0,0); bottomright (width-1,height-1)
	// Space coordinates are defined by the frustum, origin at center, +x right, +y up.
	//
	// Input touch coordinates are translated immediately from screen to space.
	// All bullet coordinates are in space coordinates.

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

		function update(dt) {
			if (on) {
				time = Math.min(time+dt, maxTime);
			}
		};

		function draw(ctx,pos) {
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

		function reset() {
			on = false;
			time = 0;
		};

		function start() {
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
	function convertFracToAbs(xfrac, yfrac) {
		var frustum = Ptero.screen.getFrustum();
		return new Ptero.Vector(
				xfrac * frustum.nearRight,
				yfrac * frustum.nearTop,
				frustum.near);
	};
	function setNextOrigin(xfrac, yfrac) {
		next_origin = convertFracToAbs(xfrac,yfrac);
	};
	function setOrigin(xfrac, yfrac) {
		origin = convertFracToAbs(xfrac,yfrac);
	};


	// the orb's targets.
	var targets;
	function setTargets(_targets) {
		targets = _targets;
	};

	function init() {
		charge.reset();
		setOrigin(0,-2);
		enableTouch();
	};

	function update(dt) {
		origin.ease_to(next_origin, 0.1);
		Ptero.bulletpool.update(dt);
		charge.update(dt);
	};

	function draw(ctx) {
		var radius = getRadius();
		var p = Ptero.screen.spaceToScreen(origin);

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(p.x,p.y,radius, 0, 2*Math.PI);
		ctx.fill();
		charge.draw(ctx,p);
	};

	// Get a unit vector pointing from the origin to the given point in space.
	function getAimVector(point) {
		return point.copy().sub(origin).normalize();
	};

	// Highlights specific targets for debugging. (currently the lock-on target).
	var shotTarget = null;
	var setShotTarget = function(target) {
		if (shotTarget) {
			shotTarget.highlight = false;
		}
		shotTarget = target;
		if (shotTarget) {
			shotTarget.highlight = true;
		}
	};

	// Player will only hit a target if their aim is within this angle.
	var max2dHitAngle = 5 * Math.PI/180;

	// Try to fire a bullet into the given direction.
	function shoot(aim_vector) {
		var target_info = chooseTargetFromAimVector(aim_vector);
		//setShotTarget(target);

		// create bullet
		var bullet, bulletCone;
		if (!target) {
			bulletCone = getDefaultBulletCone(aim_vector);
			bullet = createBulletFromCone(bulletCone, aim_vector);
		}
		else {
			var aim2dAngle = get2dAimAngle(target.getPosition(), aim_vector);
			if (!target.isGoingToDie && aim2dAngle < max2dHitAngle) {
				bullet = createHomingBullet(target);
				target.isGoingToDie = true;
			}
			else {
				bulletCone = getTargetBulletCone(target);
				bullet = createBulletFromCone(bulletCone, aim_vector);
			}
		}

		if (bullet) {
			Ptero.bulletpool.add(bullet);
		}
		else {
			console.error("unable to create bullet");
		}
	};

	// Returns the angle between the target projected on the screen and the aim vector.
	function get2dAimAngle(target_pos, aim_vector) {
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var target_vec = getAimVector(target_proj);
		var target_angle = target_vec.angle(aim_vector);
		return target_angle;
	};

	// Returns the angle between the target and the aim vector.
	function get3dAimAngle(target_pos, aim_vector) {
		var target_vec = getAimVector(target_pos);
		var target_angle = target_vec.angle(aim_vector);
		return target_angle;
	};

	function sign(a) {
		if (a < 0) {
			return -1;
		}
		else (a > 0) {
			return 1;
		}
		return 0;
	};

	function isAimInsideCorners(aim, corners) {
		var i,corner;
		var proj;
		var cross,prev_cross;
		var angle;
		for (i=0; i<4; i++) {
			corner = corners[i];
			proj = Ptero.screen.getFrustum().projectToNear(corner);
			cross = proj.x * aim.y - aim.x * proj.y;
			angle = get2dAimAngle(corner, aim);

			// Fail if corners are behind the aiming vector's reach.
			if (angle > Math.PI/2) {
				return false;
			}

			// Succeed if the corners are on two sides of the aiming vector.
			if (prev_cross != undefined && sign(cross) != sign(prev_cross)) {
				return true;
			}

			prev_cross = cross;
		}
	};

	// Choose which target to shoot with the given aiming vector.
	function chooseTargetFromAimVector(aim_vector) {

		// find visible cube nearest to our line of trajectory
		var closest_miss_angle = 15*Math.PI/180;
		var closest_miss_z = Infinity;
		var closest_miss_target = null;

		var closest_hit_target = null;
		var closest_hit_z = Infinity;

		var i,len;
		var frustum = Ptero.screen.getFrustum();
		var z;
		for (i=0,len=targets.length; targets && i<len; ++i) {
			if (!targets[i].isHittable()) {
				continue;
			}

			// skip if not visible
			var target_pos = targets[i].getPosition();
			if (!frustum.isInside(target_pos)) {
				continue;
			}

			// Skip if this target is further away than an existing closer hit.
			z = target_pos.z;
			if (z > closest_hit_z) {
				continue;
			}

			var target_billboard = targets[i].getBillboard();
			var target_rect = target_billboard.getSpaceRect(target_pos);
			var corners = [target_rect.tl, target_rect.tr, target_rect.bl, target_rect.br];

			if (isAimInsideCorners(aim_vector,corners)) {
				closest_hit_z = z;
				closest_hit_target = targets[i];
			}
			else {
				var target2dAngle = get2dAimAngle(target_pos, aim_vector);
				// update closest
				if (target2dAngle < closest_miss_angle && z < closest_miss_z) {
					closest_miss_z = z;
					closest_miss_angle = target2dAngle;
					closest_miss_target = targets[i];
				}
			}
		}
		if (closest_hit_target) {
			return {
				hit: true,
				target: closest_hit_target,
			};
		}
		else if (closest_miss_target) {
			return {
				hit: false,
				target: closest_miss_target,
			};
		}
		else {
			return null;
		}
	};

	function getBulletSpeed() {
		var frustum = Ptero.screen.getFrustum();
		return frustum.nearTop * 120;
	}

	// Create a bullet with the necessary trajectory to hit the given target.
	function createHomingBullet(target) {

		// Create bullet with default speed.
		var bullet = new Ptero.Bullet;
		bullet.collideTarget = target;
		bullet.speed = getBulletSpeed();

		// Create time window and step size to search for a collision.
		var t;
		var maxT = bullet.lifeTime; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		// Determine the threshold for a valid collision.
		var dist, minDist = Infinity;

		// Find when the bullet will collide with the target.
		var target_pos;
		for (t=0; t < maxT; t += dt)
		{
			// Get the target position at time t.
			target_pos = target.getFuturePosition(t);

			// Aim bullet at target and advance to time t.
			bullet.time = 0;
			bullet.pos.set(origin);
			bullet.dir.set(getAimVector(target_pos));
			bullet.update(t);

			// Determine distance between target and bullet.
			dist = bullet.pos.dist(target_pos);

			// Update the collision info when closest distance reached.
			if (dist < minDist) {
				bullet.collideTime = t;
				bullet.collideDir = bullet.dir.copy();
				minDist = dist;
			}
		}

		// Aim bullet at point of closest distance.
		bullet.dir.set(bullet.collideDir);

		// Reset bullet position and time.
		bullet.time = 0;
		bullet.pos.set(origin);

		return bullet;
	};

	function getTargetBulletCone(target) {
		var target_pos = target.getPosition();
		var z = target_pos.z;
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var r = target_proj.dist(origin);
		return {r:r, z:z};
	};

	function getDefaultBulletCone() {
		var frustum = Ptero.screen.getFrustum();
		return {r: frustum.nearTop, z: frustum.near * 3};
	};

	function createBulletFromCone(cone, aim_vector) {
		var frustum = Ptero.screen.getFrustum();
		var vector = aim_vector.copy().mul(cone.r);
		vector.add(origin);
		vector.set(frustum.projectToZ(vector,cone.z)).sub(origin).normalize();

		var bullet = new Ptero.Bullet;
		bullet.speed = getBulletSpeed();
		bullet.pos.set(origin);
		bullet.dir.set(vector);
		return bullet;
	};

	// Create touch controls.
	var touchHandler = (function(){

		// Determine if the given point is in the orb's touch surface.
		function isInside(point) {
			var r = getSpaceRadius();
			return point.dist_sq(origin) <= r*r;
		};

		// Start the charge if touch starts inside the orb.
		function start(point) {
			if (isInside(point)) {
				charge.start();
			}
		};

		// Shoot a bullet when the touch point exits the orb.
		function move(point) {
			if (charge.isOn() && !isInside(point)) {
				charge.reset();
				shoot(getAimVector(point));
			}
		};

		// Stop charging if touch point is released or canceled.
		function end() {
			charge.reset();
		};
		function cancel() {
			charge.reset();
		};

		// Convert the incoming xy coords from screen to space.
		function wrapFunc(f) {
			return function screenToSpaceWrapper(x,y) {
				var point = Ptero.screen.screenToSpace({x:x,y:y});
				f(point);
			};
		};
		return {
			start: wrapFunc(start),
			move: wrapFunc(move),
			end: wrapFunc(end),
			cancel: wrapFunc(cancel),
		};
	})();
	function enableTouch() {
		Ptero.input.addTouchHandler(touchHandler);
	};
	function disableTouch() {
		Ptero.input.removeTouchHandler(touchHandler);
	};

	return {
		init: init,
		draw: draw,
		setTargets: setTargets,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
	};
})();
