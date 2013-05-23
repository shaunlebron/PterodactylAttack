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
	var startOrigin;
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

	var shouldDrawCones = false;
	function drawCone(ctx,target) {
		// Note: We are only drawing these cones if the we are charging (i.e. touch started from within the circle)
		//  This is indicated by a non-null value in "startOrigin".

		if (!startOrigin || !shouldDrawCones || !target.isHittable()) {
			return;
		}

		var billboard = target.getBillboard();
		var pos = target.getPosition();
		var rect = billboard.getSpaceRect(pos);
		var corners = [rect.tl, rect.tr, rect.bl, rect.br];

		var painter = Ptero.painter;
		var alpha = 0.3;

		// Note: We are not drawing the red cone region because the start origin is no longer a static point.
		//   As soon as we release, the startOrigin is no longer valid, making no opportunity to draw the red cone.
		ctx.fillStyle = target.isGoingToDie ? "rgba(255,0,0,"+alpha+")" : "rgba(255,255,255,"+alpha+")";
		ctx.strokeStyle = "rgba(0,0,0,"+alpha+")";

		var frustum = Ptero.screen.getFrustum();

		var lc,rc;
		var i;
		var lAngle, rAngle;
		var minAngle = Infinity, maxAngle = -Infinity;
		var center_aim = getAimVector(frustum.projectToNear(pos));
		for (i=0; i<4; i++) {
			var corner_aim = getAimVector(frustum.projectToNear(corners[i]));
			var angle = corner_aim.angleTo(center_aim) * sign(corner_aim.cross(center_aim).z);
			if (angle < minAngle) {
				minAngle = angle;
				lc = corners[i];
			}
			if (angle > maxAngle) {
				maxAngle = angle;
				rc = corners[i];
			}
		}

		ctx.beginPath();
		painter.moveTo(ctx, startOrigin);
		painter.lineTo(ctx, lc);
		painter.lineTo(ctx, rect.tl);
		painter.lineTo(ctx, rect.tr);
		painter.lineTo(ctx, rc);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	function draw(ctx) {
		var radius = getRadius();
		var p = Ptero.screen.spaceToScreen(origin);

		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(p.x,p.y,radius, 0, 2*Math.PI);
		ctx.fill();
		charge.draw(ctx,p);
	};

	// Get a unit vector pointing from the startOrigin to the given point in space.
	function getAimVector(point) {
		return point.copy().sub(startOrigin).normalize();
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

	function shootHoming(aim_vector) {
		var target = selectedTargets[0];
		deselectTarget(target);
		target.lockedon = true;

		var time = 1.5;
		var endPos = target.getFuturePosition(time);
		if (!endPos) {
			target.lockedon = false;
			return;
		}

		bulletCone = getBulletConeAtPos(target.getPosition());
		var midBullet = createBulletFromCone(bulletCone, aim_vector, getBulletSpeed()/2);
		var midTime = 0.2;
		midBullet.update(midTime);
		var midPos = midBullet.getPosition();

		var bullet = new Ptero.PathBullet(
			new Ptero.Path(
				new Ptero.makeHermiteInterpForObjs(
					[startOrigin,midPos,endPos],
					['x','y','z'],
					[0,midTime,time-midTime]
				)
			)
		);

		if (time < target.getTimeLeftInPath()) {
			bullet.collideTarget = target;
		}

		// Add the new bullet to our bullet collection.
		Ptero.bulletpool.add(bullet);
	}


	// Try to fire a bullet into the given direction with target leading in mind.
	function shootWithLead(aim_vector) {

		var t;
		var maxT = 1; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		var i,numTargets=targets.length;
		var target;

		for (t=0; t<=maxT; t+=dt) {
			for (i=0; i<numTargets; i++) {
				target = targets[i];

				// do not try to hit a dead or invisible target
				var pos = target.getPosition();
				if (!pos) {
					continue;
				}

				// do not try to hit a target that will be dead or invisible
				pos = target.getFuturePosition(t);
				if (!pos) {
					continue;
				}

				var cone = getBulletConeAtPos(pos);
				var bullet = createBulletFromCone(cone, aim_vector);
				bullet.update(t);
			}
		}
	}

	// Try to fire a bullet into the given direction.
	function shoot(aim_vector) {

		// Determine which target to aim at.
		var target_info = chooseTargetFromAimVector(aim_vector);
		var isHit = target_info.hit;
		var target = target_info.target;
		//setShotTarget(target);

		var bullet,bulletCone;

		if (target) {

			// Get ideal bullet that would hit the enemy.
			var homingBullet = createHomingBullet(target);
			if (!homingBullet) {
				return;
			}

			// Advance bullet to the time of collision to get the collision position.
			homingBullet.update(homingBullet.collideTime);

			// Do not register a hit if the collision position is behind the orb.
			if (homingBullet.pos.z <= 0) {
				isHit = false;
			}

			// Craft a cone to the point of ideal collision.
			bulletCone = getBulletConeAtPos(homingBullet.pos);

			// Create a bullet path along the cone with the given aiming vector.
			bullet = createBulletFromCone(bulletCone, aim_vector);

			// Only set the bullet to collide if the target is not already going to be hit.
			if (isHit && !target.isGoingToDie) {
				bullet.collideTime = homingBullet.collideTime;
				bullet.collideTarget = target;
				target.isGoingToDie = true;
			}
		}
		else {
			// Create a default bullet path not aimed a specific target.
			bulletCone = getDefaultBulletCone(aim_vector);
			bullet = createBulletFromCone(bulletCone, aim_vector);
		}

		// Add the new bullet to our bullet collection.
		Ptero.bulletpool.add(bullet);
		Ptero.audio.playShoot();
	};

	// Returns the angle between the target projected on the screen and the aim vector.
	function get2dAimAngle(target_pos, aim_vector) {
		var target_proj = Ptero.screen.getFrustum().projectToNear(target_pos);
		var target_vec = getAimVector(target_proj);
		var target_angle = target_vec.angleTo(aim_vector);
		return target_angle;
	};

	// Returns the angle between the target and the aim vector.
	function get3dAimAngle(target_pos, aim_vector) {
		var target_vec = getAimVector(target_pos);
		var target_angle = target_vec.angleTo(aim_vector);
		return target_angle;
	};

	function sign(a) {
		if (a < 0) {
			return -1;
		}
		else if (a > 0) {
			return 1;
		}
		return 0;
	};

	function isAimInsideCorners(aim, corners) {
		var i,corner;
		var corner_proj;
		var corner_aim;
		var cross,prev_cross;
		var angle;
		for (i=0; i<4; i++) {
			corner = corners[i];
			corner_proj = Ptero.screen.getFrustum().projectToNear(corner);
			corner_aim = getAimVector(corner_proj);
			cross = corner_aim.cross(aim).z;
			angle = get2dAimAngle(corner_aim, aim);

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
			var target_pos = targets[i].getPosition();

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
		else {
			return {
				hit: false,
				target: closest_miss_target,
			};
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
		var maxT = 1; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		// Determine the threshold for a valid collision.
		var dist, minDist = Infinity;

		// Find when the bullet will collide with the target.
		var target_pos;
		for (t=0; t < maxT; t += dt)
		{
			// Get the target position at time t.
			target_pos = target.getFuturePosition(t);
			if (!target_pos) {
				continue;
			}

			// Aim bullet at target and advance to time t.
			bullet.time = 0;
			bullet.pos.set(startOrigin);
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

		if (minDist == Infinity) {
			return null;
		}

		// Aim bullet at point of closest distance.
		bullet.dir.set(bullet.collideDir);

		// Reset bullet position and time.
		bullet.time = 0;
		bullet.pos.set(startOrigin);

		return bullet;
	};

	function getBulletConeAtPos(pos) {
		var z = pos.z;
		var proj = Ptero.screen.getFrustum().projectToNear(pos);
		var r = proj.dist(startOrigin);
		return {r:r, z:z};
	};

	function getDefaultBulletCone() {
		var frustum = Ptero.screen.getFrustum();
		return {r: frustum.nearTop, z: frustum.near * 3};
	};

	function createBulletFromCone(cone, aim_vector, speed) {
		var frustum = Ptero.screen.getFrustum();
		var vector = aim_vector.copy().mul(cone.r);
		vector.add(startOrigin);
		vector.set(frustum.projectToZ(vector,cone.z)).sub(startOrigin).normalize();

		var bullet = new Ptero.Bullet;
		bullet.speed = speed || getBulletSpeed();
		bullet.pos.set(startOrigin);
		bullet.dir.set(vector);
		return bullet;
	};

	var selectedTargets = [];
	function selectTarget(target) {
		target.selected = true;
		selectedTargets.push(target);
	}
	function deselectTarget(target) {
		target.selected = false;

		// remove target from list
		for (i=0,len=selectedTargets.length; targets && i<len; ++i) {
			if (selectedTargets[i] == target) {
				selectedTargets.splice(i,1);
				break;
			}
		}
	};
	function toggleTargetAt(screenX, screenY) {
		var i,len,target;
		var closest_index = null;
		var closest_dist = Infinity;
		var targetScreenPos, targetPos;
		var dx,dy,dist;
		for (i=0,len=targets.length; targets && i<len; ++i) {
			target = targets[i];
			if (!target.isHittable()) {
				continue;
			}
			targetPos = target.getPosition();
			targetScreenPos = Ptero.screen.spaceToScreen(targetPos);
			dx = screenX-targetScreenPos.x;
			dy = screenY-targetScreenPos.y;
			dist = dx*dx + dy*dy;
			if (dist < closest_dist && target.getBillboard().isInsideScreenRect(screenX,screenY,targetPos)) {
				closest_dist = dist;
				closest_index = i;
			}
		}

		if (closest_index != null) {
			target = targets[closest_index];
			if (target.selected) {
				deselectTarget(target);
			}
			else {
				selectTarget(target);
			}
		}
	};
	function deselectAllTargets() {
		var i,len,target;
		for (i=0,len=targets.length; targets && i<len; ++i) {
			target = targets[i];
			target.selected = false;
		}
		selectedTargets.length = 0;
	}
	function selectTargetAt(screenX, screenY) {
		var i,len,target;
		for (i=0,len=targets.length; targets && i<len; ++i) {
			target = targets[i];
			if (target.lockedon || !target.isHittable()) {
				continue;
			}
			if (target.getBillboard().isInsideScreenRect(screenX,screenY,target.getPosition())) {
				if (!target.selected) {
					selectTarget(target);
				}
			}
		}
	};

	// Create touch controls.
	var touchHandler = (function(){
		var startIn = false;
		// Determine if the given point is in the orb's touch surface.
		function isInside(nearPoint) {
			var r = getSpaceRadius();
			return nearPoint.dist_sq(origin) <= r*r;
		};

		// Start the charge if touch starts inside the orb.
		function start(nearPoint,screenPoint) {
			if (isInside(nearPoint)) {
				charge.start();
				startOrigin = nearPoint;
				startIn = true;
			}
			else {
				startIn = false;
				toggleTargetAt(screenPoint.x, screenPoint.y);
			}
		};

		// Shoot a bullet when the touch point exits the orb.
		function move(nearPoint,screenPoint) {
			if (charge.isOn()) {
				if (!isInside(nearPoint)) {
					charge.reset();
					if (selectedTargets[0]) {
						shootHoming(getAimVector(nearPoint));
					}
					else {
						shoot(getAimVector(nearPoint));
					}
				}
			}
			else if (!startIn) {
				selectTargetAt(screenPoint.x, screenPoint.y);
			}
		};

		function endAndCancel(nearPoint) {
			charge.reset();
			startOrigin = null;
			if (isInside(nearPoint)) {
				if (startIn) {
					deselectAllTargets();
				}
			}
		};

		// Stop charging if touch point is released or canceled.
		function end(nearPoint) {
			endAndCancel(nearPoint);
		};
		function cancel(nearPoint) {
			endAndCancel(nearPoint);
		};

		// Convert the incoming xy coords from screen to space.
		function wrapFunc(f) {
			return function screenToSpaceWrapper(x,y) {
				var screenPoint = {x:x,y:y};
				var nearPoint = Ptero.screen.screenToSpace({x:x,y:y});
				f(nearPoint,screenPoint);
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
		setDrawCones: function(on) { shouldDrawCones = on; },
		toggleDrawCones: function() { shouldDrawCones = !shouldDrawCones; },
		drawCone: drawCone,
		setTargets: setTargets,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
		deselectTarget: deselectTarget,
	};
})();
