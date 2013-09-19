
Ptero.scene_credits = (function(){

	var buttonList;

	var contentList;

	function cleanup() {
		buttonList.disable();
		contentList.disable();
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {
		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_credits"]);

		var btns = buttonList.namedButtons;

		btns["wrench"].onclick = function() {
			Ptero.setScene(Ptero.scene_options);
		};

		btns["strong"].onclick = function() {
			Ptero.setScene(Ptero.scene_highscore);
		};

		btns["scroll"].onclick = function() {
			Ptero.setScene(Ptero.scene_credits);
		};

		var b = btns["back"];
		b.isClickDelay = true;
		b.onclick = function() {
			Ptero.setScene(Ptero.scene_menu);
		};

		contentList = new Ptero.ButtonList(Ptero.assets.json["btns_credits_content"]);
		contentList.enable();

		buttonList.enable();

		scroll.resetPos();
		scroll.setAutoScroll(true);

		Ptero.input.addTouchHandler(touchHandler);
		scroll.animateIn();
	}

	var scroll = (function(){

		var minPos = -3605;
		var maxPos = 0;
		var displacement;

		var pos;
		var vel;
		var decel = 2000;

		var isAutoScroll;

		function resetPos() {
			pos = maxPos;
		}

		function getPos() {
			return pos;
		}

		function setPos(y) {
			pos = y;
			
			var h = Ptero.screen.getWindowHeight();
			var s;

			// condense a potentially infinite distance so that it only approaches a given maximum distance
			function bungeeDistance(dy, maxDy) {
				var critical_dist = maxDy*3;
				var critical_slope = Math.PI/2 * 0.7;
				var slope = dy / critical_dist * critical_slope;
				return Math.atan(slope) / (Math.PI/2) * maxDy;
			}

			if (pos < minPos) {
				pos = minPos + bungeeDistance(pos-minPos, h);
			}
			else if (pos > maxPos) {
				pos = maxPos + bungeeDistance(pos-maxPos, h);
			}
		}

		function setVel(vy) {
			vel = vy;
		}

		function update(dt) {
			var dtLeft = dt;
			while (dtLeft > 0) {
				displacement *= 0.7;
				dtLeft -= 1/60;
			}
			if (isAutoScroll) {
				pos -= dt*50;
			}
			else if (isPhysicsOn) {
				if (vel < 0) {
					vel = Math.min(0, vel + decel*dt);
				}
				else if (vel > 0) {
					vel = Math.max(0, vel - decel*dt);
				}
				pos += vel*dt;
				if (pos > maxPos) {
					vel = 0;
					var dtLeft = dt;
					while (dtLeft > 0) {
						pos += (maxPos - pos)*0.3;
						dtLeft -= 1/60;
					}
				}
				else if (pos < minPos) {
					vel = 0;
					var dtLeft = dt;
					while (dtLeft > 0) {
						pos += (minPos - pos)*0.3;
						dtLeft -= 1/60;
					}
				}
			}
		}

		function draw(ctx) {
			ctx.save();
			ctx.translate(0, pos+displacement);
			contentList.draw(ctx);
			ctx.restore();
		}

		function setAutoScroll(on) {
			isAutoScroll = on;
			vel = 0;
		}

		function enablePhysics(on) {
			isPhysicsOn = on;
		}

		var displacement;
		function animateIn() {
			displacement = Ptero.screen.getWindowHeight();
		}
		
		return {
			enablePhysics: enablePhysics,
			resetPos: resetPos,
			getPos: getPos,
			setPos: setPos,
			setVel: setVel,
			update: update,
			draw: draw,
			setAutoScroll: setAutoScroll,
			animateIn: animateIn,
		}
	})();

	var touchHandler = (function(){

		var startTouchPos;
		var startScrollPos;
		var speed = 0;
		var speedAvgFactor = 0.8;
		var lastPos;

		function start(x,y) {
			startTouchPos = y;
			startScrollPos = scroll.getPos();

			scroll.setAutoScroll(false);
			scroll.enablePhysics(false);

			speed = 0;
			lastPos = y;
		}

		function move(x,y) {
			scroll.setPos(startScrollPos + (y-startTouchPos));

			var currSpeed = (y-lastPos)/lastDt;
			var a = speedAvgFactor;
			speed = a*currSpeed + (1-a)*speed;
			lastPos = y;
		}

		function end(x,y) {
			scroll.setVel(speed);
			scroll.enablePhysics(true);
		}

		function cancel(x,y) {
			end(x,y);
		}

		return {
			coord: "window",
			start: start,
			move: move,
			end: end,
			cancel: cancel,
		};
	})();

	var lastDt;
	function update(dt) {
		lastDt = dt;
		scroll.update(dt);
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		buttonList.draw(ctx);
		scroll.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
