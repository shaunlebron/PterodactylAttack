
Ptero.Remote.orb = (function(){

	var blinkTimer = 0;
	var blinkPeriod = 0.125;
	var blinkFillStyle = "rgba(0,0,0,0.5)";
	function blink() {
		blinkTimer = 0.5;
	}
	function updateBlinkTimer(dt) {
		blinkTimer = Math.max(0, blinkTimer-dt);

		var on = "rgba(255,0,0,0.5)";
		var off = "rgba(0,0,0,0.5)";
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
	var updateOrigin = (function(){
		var time = 0;
		var step = 1/60;
		return function(dt) {
			time += dt;
			while (time - step >= 0) {
				time -= step;
				origin.x += (next_origin.x - origin.x) * 0.3;
				origin.y += (next_origin.y - origin.y) * 0.3;
				origin.z += (next_origin.z - origin.z) * 0.3;
			}
		};
	})();

	function init() {
		charge.reset();
		setOrigin(0,-2);
		enableTouch();
		engageNet(false);
	};

	function update(dt) {
		updateOrigin(dt);
		charge.update(dt);
		flickSpring.update(dt);
		updateBlinkTimer(dt);
	};

	var flickSpring = (function(){
		var time = 0;
		var maxTime = 0.3;
		var freq = 8;
		var period = 1/freq;
		var displacement = 0;
		var vector = null;

		return {
			start: function(aim_vector) {
				time = maxTime;
				vector = aim_vector.copy();
				vector.y *= -1;
			},
			update: function(dt) {
				time = Math.max(0, time-dt);
				var t;
				var range = getRadius() * 0.1;
				if (time > 0) {
					t = maxTime - time;
					//displacement = Math.cos(t/period*Math.PI*2)*range*(time/maxTime);
					displacement = range*(time/maxTime);
				}
				else {
					displacement = 0;
				}
			},
			getTranslate: function() {
				if (!vector) {
					vector = new Ptero.Vector(0,0);
				}
				return vector.copy().mul(displacement);
			},
		};
	})();

	function draw(ctx) {
		var radius = getRadius();
		var p = Ptero.screen.spaceToWindow(origin);

		ctx.save();
		ctx.translate(p.x, p.y);
		var trans = flickSpring.getTranslate();
		ctx.translate(trans.x, trans.y);

		ctx.fillStyle = blinkFillStyle;
		//ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		ctx.arc(0,0,radius, 0, 2*Math.PI);
		ctx.fill();
		if (isNet) {
			ctx.strokeStyle = "#FFF";
			ctx.lineWidth = 4;
			ctx.beginPath();
			var i,len=8;
			for (i=0; i<len; i++) {
				ctx.moveTo(0,0);
				var a = Math.PI/(len-1)*i;
				var x = Math.cos(a)*radius;
				var y = Math.sin(a)*radius;
				ctx.lineTo(x,-y);
			}
			ctx.stroke();
			len=4;
			for (i=0; i<len; i++) {
				ctx.beginPath();
				ctx.arc(0,0,radius/len*(i+1),0,Math.PI*2);
				ctx.stroke();
			}
		}
		ctx.restore();

		charge.draw(ctx,p);

	};

	// Get a unit vector pointing from the startOrigin to the given point in space.
	function getAimVector(point) {
		return point.copy().sub(startOrigin).normalize();
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
				//blink();
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
					var v = getAimVector(nearPoint);
					var aim_vector = {
						x: v.x,
						y: v.y,
						z: v.z,
					};
					var pos_vector = {
						x: startOrigin.x,
						y: startOrigin.y,
						z: startOrigin.z,
					};
					Ptero.socket.emit('shoot', { aim: aim_vector, pos: pos_vector });
				}
			}
		};

		function endAndCancel(nearPoint,screenPoint,i) {
			if (startIndex != i) {
				return;
			}

			charge.reset();
			startOrigin = null;
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
	function engageNet(on) {
		isNet = on;
		console.log('net', on);
		Ptero.socket.emit('net', on);
	};

	return {
		init: init,
		draw: draw,
		engageNet: engageNet,
		setOrigin: setOrigin,
		setNextOrigin: setNextOrigin,
		update: update,
		enableTouch: enableTouch,
		disableTouch: disableTouch,
	};
})();
