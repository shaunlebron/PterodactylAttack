Ptero.orb = (function(){

	// enable guide that shows you how to attack enemies
	var showGuide;
	function enableGuide(on) {
		showGuide = on;
	}

	var swipePos;
	var swipeAnimInterp;
	var swipeAlpha;
	var swipeTimer;
	function startSwipeAnim(targetPos) {
		var frustum = Ptero.frustum;
		var swipePos = (new Ptero.Vector).set({x:0, y:frustum.nearBottom/4*3, z:frustum.near});
		var swipeDir = (new Ptero.Vector).set(targetPos).sub(swipePos).normalize();
		var swipePos2 = (new Ptero.Vector).set(swipeDir).mul(frustum.nearHeight/4).add(swipePos);
		var dt = 1/3;
		swipeTimer = 0;
		swipeAnimInterp = Ptero.makeInterpForObjs('linear',
			[
				{ alpha: 0, x: swipePos.x, y: swipePos.y, z: swipePos.z },
				{ alpha: 1, x: swipePos.x, y: swipePos.y, z: swipePos.z },
				{ alpha: 1, x: swipePos2.x, y: swipePos2.y, z: swipePos2.z },
				{ alpha: 0, x: swipePos2.x, y: swipePos2.y, z: swipePos2.z },
			],
			['alpha', 'x', 'y', 'z'],
			[0,dt,dt,dt]);
	}
	function updateSwipeAnim(dt) {
		if (swipeAnimInterp) {
			swipeTimer += dt;
			var s = swipeAnimInterp(swipeTimer);
			if (s) {
				swipePos = {
					x: s.x,
					y: s.y,
					z: s.z,
				};
				swipeAlpha = s.alpha;
			}
			else {
				swipePos = null;
				swipeAlpha = null;
				swipeAnimInterp = null;
			}
		}
	}

	var blinkTimer = 0;
	var blinkPeriod = 0.125;
	var blinkFillStyle = "rgba(0,0,0,0.5)";
	function blink() {
		blinkTimer = 1;
	}
	function updateBlinkTimer(dt) {
		blinkTimer = Math.max(0, blinkTimer-dt);

		var on = "rgba(0,255,255,0.5)";
		var off = "rgba(255,255,255,0)";
		blinkFillStyle = (Math.floor(blinkTimer / blinkPeriod) % 2) ? on : off;
	}
	
	// A note about coordinate systems:
	// Screen coordinates are usual pixel coordinates: topleft (0,0); bottomright (width-1,height-1)
	// Space coordinates are defined by the frustum, origin at center, +x right, +y up.
	//
	// Input touch coordinates are translated immediately from screen to space.
	// All bullet coordinates are in space coordinates.

	// radius of the orb on screen and in space
	function getRadius() {
		return Ptero.screen.getWindowHeight()/2 * (1/2*0.8);
	}
	function getSpaceRadius() {
		return getRadius() / Ptero.frustum.scale;
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
		var frustum = Ptero.frustum;
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
		enableNet(false);
	};

	function update(dt) {
		origin.ease_to(next_origin, 0.3);
		Ptero.bulletpool.update(dt);
		charge.update(dt);
		updateBlinkTimer(dt);
		updateSwipeAnim(dt);
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

		ctx.fillStyle = target.isGoingToDie ? "rgba(255,0,0,"+alpha+")" : "rgba(255,255,255,"+alpha+")";
		ctx.strokeStyle = "rgba(0,0,0,"+alpha+")";

		var frustum = Ptero.frustum;

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
		var p = Ptero.screen.spaceToWindow(origin);

		//ctx.fillStyle = blinkFillStyle;
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(p.x,p.y,radius, 0, 2*Math.PI);
		ctx.fill();
		if (isNet) {
			ctx.strokeStyle = "#FFF";
			ctx.lineWidth = 4;
			ctx.beginPath();
			var i,len=8;
			for (i=0; i<len; i++) {
				ctx.moveTo(p.x,p.y);
				var a = Math.PI/(len-1)*i;
				var x = Math.cos(a)*radius;
				var y = Math.sin(a)*radius;
				ctx.lineTo(p.x+x,p.y-y);
			}
			ctx.stroke();
			len=4;
			for (i=0; i<len; i++) {
				ctx.beginPath();
				ctx.arc(p.x,p.y,radius/len*(i+1),0,Math.PI*2);
				ctx.stroke();
			}
		}
		charge.draw(ctx,p);

		if (swipePos) {
			var backupAlpha = ctx.globalAlpha;
			ctx.globalAlpha = swipeAlpha;

			var p = Ptero.screen.spaceToWindow(swipePos);
			ctx.fillStyle = "rgba(255,255,255,0.3)";
			radius /= 4;
			ctx.beginPath();
			ctx.arc(p.x, p.y, radius, 0, 2*Math.PI);
			ctx.fill();

			var sprite = Ptero.assets.sprites["swipe"];
			sprite.draw(ctx, swipePos);
			ctx.globalAlpha = backupAlpha;
		}
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


	function collideBulletWithBg(bullet) {
		var startZ = bullet.pos.z;
		var endZ, collideTime;
		var collideZ = Infinity;
		if (bullet.collideTarget) {
			endZ = bullet.pos.z + bullet.dir.z * bullet.speed * bullet.collideTime;

			// test against all layers between Z bounds
			var layerCollisions = Ptero.background.getLayerCollisions();
			var i,len=layerCollisions.length;
			for (i=0; i<len; i++) {
				var shapeGroup = layerCollisions[i];
				if (shapeGroup) {

					// get this layer's depth
					var z = shapeGroup[0].points[0].z;

					// skip this depth if it is not in our search range
					if (!(z > startZ && z < endZ && z < collideZ)) {
						continue;
					}

					// get time and position of bullet when it reaches the layer
					var t = (z - bullet.pos.z) / (bullet.dir.z * bullet.speed);
					var x = bullet.pos.x + bullet.dir.x * bullet.speed * t;
					var y = bullet.pos.y + bullet.dir.y * bullet.speed * t;

					// test collision on every shape in this layer
					var j,numShapes = shapeGroup.length;
					for (j=0; j<numShapes; j++) {
						var shape = shapeGroup[j];
						if (shape.isPointInside(x,y)) {
							collideZ = z;
							collideTime = t;
							break;
						}
					}
				}
			}

			if (collideZ < Infinity) {
				bullet.collideTarget = null;
				bullet.collideTime = collideTime;
			}
			else {
				bullet.collideTarget.isGoingToDie = true;
			}
		}
		else {

			// test against all layers after start Z
			var layerCollisions = Ptero.background.getLayerCollisions();
			var i,len=layerCollisions.length;
			for (i=0; i<len; i++) {
				var shapeGroup = layerCollisions[i];
				if (shapeGroup) {

					// get this layer's depth
					var z = shapeGroup[0].points[0].z;

					// skip this depth if it is not in our search range
					if (!(z > startZ && z < collideZ)) {
						continue;
					}

					// get time and position of bullet when it reaches the layer
					var t = (z - bullet.pos.z) / (bullet.dir.z * bullet.speed);
					var x = bullet.pos.x + bullet.dir.x * bullet.speed * t;
					var y = bullet.pos.y + bullet.dir.y * bullet.speed * t;

					// test collision on every shape in this layer
					var j,numShapes = shapeGroup.length;
					for (j=0; j<numShapes; j++) {
						var shape = shapeGroup[j];
						if (shape.isPointInside(x,y)) {
							collideZ = z;
							collideTime = t;
							break;
						}
					}
				}
			}

			// set collide time if exists
			if (collideZ < Infinity) {
				bullet.collideTime = collideTime;
			}
		}
	}

	// Try to fire a bullet into the given direction with target leading in mind.
	function shootWithLead(aim_vector) {

		var t;
		var maxT = 1; // only search this many seconds ahead.
		var dt = 1/100; // search in increments of dt.

		var i,numTargets=targets.length;
		var target;

		var collideDist = Ptero.frustum.nearWidth/2;
		var minDist = collideDist*4;
		var minBullet;
		var minTarget;
		var bullet;

		for (t=0; t<=maxT; t+=dt) {
			for (i=0; i<numTargets; i++) {
				target = targets[i];
				if (!target.isHittable()) {
					continue;
				}

				// do not try to hit a dead or invisible target
				var pos0 = target.getPosition();
				if (!pos0) {
					continue;
				}

				// do not try to hit a target that will be dead or invisible
				var pos = target.getFuturePosition(t);
				if (!pos || pos.z <= 0) {
					continue;
				}

				var cone = getBulletConeAtPos(pos);
				var bullet = createBulletFromCone(cone, aim_vector);
				bullet.update(t);

				var dist = bullet.pos.dist(pos);
				if (dist < collideDist) {
					bullet = createBulletFromCone(cone, aim_vector);
					bullet.collideTime = t;
					bullet.collideTarget = target;
					if (isNet) {
						bullet.damage = -1; // negative damage is arbitrarily meant to signal a capture net
					}
					//target.isGoingToDie = true;
					collideBulletWithBg(bullet);
					Ptero.bulletpool.add(bullet);
					Ptero.audio.play('shoot');
					return;
				}
				else if (dist < minDist) {
					minDist = dist;
					minBullet = createBulletFromCone(cone, aim_vector);
					minTarget = target;
				}
				else {
					bullet = null;
				}
			}
		}

		if (minBullet) {
			bullet = minBullet;
		}
		else {
			// Create a default bullet path not aimed a specific target.
			var cone = getDefaultBulletCone(aim_vector);
			bullet = createBulletFromCone(cone, aim_vector);
		}
		collideBulletWithBg(bullet);
		if (isNet) {
			bullet.damage = -1; // negative damage is arbitrarily meant to signal a capture net
		}
		else {
			if (Ptero.score) {
				Ptero.score.addMisses(1);
			}
		}
		Ptero.bulletpool.add(bullet);
		Ptero.audio.play('shoot');
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
		Ptero.audio.play('shoot');
	};

	// Returns the angle between the target projected on the screen and the aim vector.
	function get2dAimAngle(target_pos, aim_vector) {
		var target_proj = Ptero.frustum.projectToNear(target_pos);
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
			corner_proj = Ptero.frustum.projectToNear(corner);
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
		var frustum = Ptero.frustum;
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
		var frustum = Ptero.frustum;
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
		var proj = Ptero.frustum.projectToNear(pos);
		var r = proj.dist(startOrigin);
		return {r:r, z:z};
	};

	function getDefaultBulletCone() {
		var frustum = Ptero.frustum;
		return {r: frustum.nearTop, z: frustum.near * 3};
	};

	function createBulletFromCone(cone, aim_vector, speed) {
		var frustum = Ptero.frustum;
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
			targetScreenPos = Ptero.screen.spaceToWindow(targetPos);
			dx = screenX-targetScreenPos.x;
			dy = screenY-targetScreenPos.y;
			dist = dx*dx + dy*dy;
			if (dist < closest_dist && target.getBillboard().isInsideWindowRect(screenX,screenY,targetPos)) {
				closest_dist = dist;
				closest_index = i;
			}
		}

		if (closest_index != null) {
			target = targets[closest_index];
			if (showGuide) {
				target.onTap && target.onTap();
				var targetPos = Ptero.frustum.projectToNear(target.getPosition());
				blink();
				startSwipeAnim(targetPos);
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
			if (target.getBillboard().isInsideWindowRect(screenX,screenY,target.getPosition())) {
				//blink();
			}
		}
	};

	// Create touch controls.
	var touchHandler = (function(){
		var startIn = false;
		var startIndex = null;

		function reset() {
			startIndex = null;
		}

		// Determine if the given point is in the orb's touch surface.
		function isInside(nearPoint) {
			var r = getSpaceRadius();
			return nearPoint.dist_sq(origin) <= r*r;
		};

		// Start the charge if touch starts inside the orb.
		function start(nearPoint,screenPoint,i) {

			if (startIndex != null) {
				return;
			}

			if (isInside(nearPoint)) {
				charge.start();
				startOrigin = nearPoint;
				startIn = true;
				startIndex = i;
			}
			else {
				startIn = false;
				startIndex = null;
				toggleTargetAt(screenPoint.x, screenPoint.y);
			}
		};

		// Shoot a bullet when the touch point exits the orb.
		function move(nearPoint,screenPoint,i) {
			if (startIndex != i) {
				return;
			}

			if (charge.isOn()) {
				if (!isInside(nearPoint)) {
					charge.reset();
					if (selectedTargets[0]) {
						shootHoming(getAimVector(nearPoint));
					}
					else {
						//shoot(getAimVector(nearPoint));
						shootWithLead(getAimVector(nearPoint));
					}
				}
			}
			else if (!startIn) {
				selectTargetAt(screenPoint.x, screenPoint.y);
			}
		};

		function endAndCancel(nearPoint,screenPoint,i) {
			if (startIndex != i) {
				return;
			}

			charge.reset();
			startOrigin = null;
			if (isInside(nearPoint)) {
				if (startIn) {
					deselectAllTargets();
				}
			}

			startIndex = null;
		};

		// Stop charging if touch point is released or canceled.
		function end(nearPoint,screenPoint,i) {
			endAndCancel(nearPoint,screenPoint,i);
		};
		function cancel(nearPoint,screenPoint,i) {
			endAndCancel(nearPoint,screenPoint,i);
		};

		// Convert the incoming xy coords from screen to space.
		function wrapFunc(f) {
			return function windowToSpaceWrapper(x,y,i) {
				var screenPoint = {x:x,y:y};
				var nearPoint = Ptero.screen.windowToSpace({x:x,y:y});
				f(nearPoint,screenPoint,i);
			};
		};
		return {
			coord: "window",
			reset: reset,
			start: wrapFunc(start),
			move: wrapFunc(move),
			end: wrapFunc(end),
			cancel: wrapFunc(cancel),
		};
	})();

	var touchEnabled = false;
	function enableTouch() {
		if (!touchEnabled) {
			Ptero.input.addTouchHandler(touchHandler);
			touchEnabled = true;
		}
	};
	function disableTouch() {
		if (touchEnabled) {
			touchHandler.reset();
			Ptero.input.removeTouchHandler(touchHandler);
			touchEnabled = false;
		}
	};

	var isNet = false;
	function enableNet(on) {
		isNet = on;
	};

	return {
		init: init,
		draw: draw,
		setDrawCones: function(on) { shouldDrawCones = on; },
		toggleDrawCones: function() { shouldDrawCones = !shouldDrawCones; },
		enableNet: enableNet,
		drawCone: drawCone,
		setTargets: setTargets,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
		deselectTarget: deselectTarget,
		enableGuide: enableGuide,
	};
})();
