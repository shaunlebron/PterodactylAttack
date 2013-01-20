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

	// bullet speed
	var bullet_speed = 50;

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
		Ptero.bulletpool.draw(ctx);
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

	// Try to fire a bullet into the given direction.
	var shotEnemy = null;
	function shoot(aim_vector) {
		var target = chooseTargetFromAimVector(aim_vector);
		if (shotEnemy) {
			shotEnemy.highlight = false;
		}
		shotEnemy = target;
		if (shotEnemy) {
			shotEnemy.highlight = true;
		}

		var bullet = target ? getHomingBullet(target) : getStrayBullet(aim_vector);
		if (bullet) {
			Ptero.bulletpool.add(bullet);
		}
	};

	// Choose which target to shoot with the given aiming vector.
	function chooseTargetFromAimVector(aim_vector) {

		// find visible cube nearest to our line of trajectory
		var angle = 30*Math.PI/180;
		var chosen_target = null;
		var i,len;
		var frustum = Ptero.screen.getFrustum();
		for (i=0,len=targets.length; targets && i<len; ++i) {
			if (!targets[i].isHittable()) {
				continue;
			}

			// skip if not visible
			var target_pos = targets[i].getPosition();
			if (!frustum.isInside(target_pos)) {
				//continue;
			}

			// calculate near-plane normalized vector
			var target_proj = frustum.projectToNear(target_pos);
			var target_vec = getAimVector(target_proj);
			var target_angle = target_vec.angle(aim_vector);
			console.log(target_vec, target_angle);

			// update closest
			if (target_angle < angle) {
				angle = target_angle;
				chosen_target = targets[i];
			}
		}
		return chosen_target;
	};

	// Create a bullet with the necessary trajectory to hit the given target.
	function getHomingBullet(target) {

		// Create bullet with default speed.
		var bullet = new Ptero.Bullet;
		bullet.speed = bullet_speed;

		// Create time window and step size to search for a collision.
		var t;
		var maxT = 6; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		// Determine the threshold for a valid collision.
		var dist = Infinity;
		var minDist = 0.4;

		// Search for a collision.
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

			// Set bullet's target and collide time if collision detected.
			if (dist < minDist) {
				bullet.collideTarget = target;
				bullet.collideTime = t;
				break;
			}
		}

		// If no collision was made, just aim bullet at target.
		if (!bullet.collideTarget) {
			bullet.dir.set(getAimVector(target.getPosition()));
		}

		// Reset bullet position and time.
		bullet.time = 0;
		bullet.pos.set(origin);

		return bullet;
	};

	// Create a bullet with some trajectory for the given aiming vector.
	function getStrayBullet(aim_vector) {
		return null;
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
