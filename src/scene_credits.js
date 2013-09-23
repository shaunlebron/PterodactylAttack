
Ptero.scene_credits = (function(){

	var buttonList;

	var contentList;
	var yearTitleBtn;
	var yearSubtitleBtn;
	var thanksBtn;
	var thanksY;

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
		btns = contentList.namedButtons;

		thanksBtn = btns["thanks"];
		thanksBtn.onclick = function() {
			Ptero.setScene(Ptero.scene_thanks);
		};
		thanksBtn.shouldDraw = false;
		thanksY = Ptero.screen.spaceToWindow(thanksBtn.pos).y;

		yearTitleBtn = btns["yearTitle"];
		yearSubtitleBtn = btns["yearSubtitle"];

		var y = Ptero.screen.windowToSpace({
			x: 0,
			y: 242912 + Ptero.screen.getWindowHeight(),
		}).y;
		btns["human1"].pos.y = y;
		btns["human2"].pos.y = y;
		btns["human3"].pos.y = y;
		btns["human4"].pos.y = y;
		btns["human5"].pos.y = y;

		scroll.resetPos();
		scroll.setAutoScroll(true);

		Ptero.input.addTouchHandler(touchHandler);
		scroll.animateIn();

		buttonList.enable();
		contentList.enable();
	}

	var scroll = (function(){

		var minPos = -242910;
		var maxPos = 0;
		var displacement;

		var pos;
		var vel;
		var decel = 2000;

		var isAutoScroll;

		var returnPos = null;
		function setReturnPos(p) {
			returnPos = p;
		}

		function resetPos() {
			if (returnPos != null) {
				pos = returnPos;
				returnPos = null;
			}
			else {
				pos = maxPos;
			}
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

				var oldPos = pos;
				pos += vel*dt;

				// when quickly scrolling, make sure the screen snaps to this position so the user sees it
				function stopAt(y) {
					if (oldPos <= y && y <= pos ||
						pos <= y && y <= oldPos) {
						vel = 0;
						pos = y;
					}
				}

				stopAt(-(yearToWindow(-220 * 1000 * 1000) - Ptero.screen.getWindowHeight()*0.4));
				stopAt(-(yearToWindow(-65 * 1000 * 1000) - Ptero.screen.getWindowHeight()*0.4));
				stopAt(-4539);

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

			updateButtonPositions();
		}

		// button positions have to be adjusted since canvas transforms do not affect click coordinates
		function updateButtonPositions() {
			thanksBtn.pos.y = Ptero.screen.windowToSpace({x:0,y:pos+displacement+thanksY}).y;
		}

		function draw(ctx) {
			thanksBtn.draw(ctx);

			ctx.save();
			ctx.translate(0, pos+displacement);
			drawTimeline(ctx);
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

		var yearStartInWindow = 4957.57;
		var yearStart = -220.5 * 1000 * 1000;
		var yearNotch = 100 * 1000;
		var yearMark = 1000 * 1000;
		var yearEnd = 0;

		function getYearsPerUnit() {
			var h = Ptero.screen.getWindowHeight();
			return 1000 * 1000 / (1.5*h);
		}

		function yearToWindow(year) {
			return yearStartInWindow + (year-yearStart) / getYearsPerUnit();
		}

		function windowToYear(y) {
			return (y - yearStartInWindow) * getYearsPerUnit() + yearStart;
		}

		function getYearWindowRange() {
			return {
				topYear: windowToYear(-pos),
				bottomYear: windowToYear(-pos + Ptero.screen.getWindowHeight()),
			};
		}

		function drawTimeline(ctx) {
			var r = getYearWindowRange();
			var yearBuffer = 0;
			if (r.bottomYear < yearStart || r.topYear > yearEnd) {
				return;
			}

			var firstVisibleYear = Math.max(yearStart, r.topYear);
			var lastVisibleYear = Math.min(yearEnd, r.bottomYear);

			// draw base line
			ctx.beginPath();
			var x = Ptero.screen.getWindowWidth()/2;
			var y1 = yearToWindow(firstVisibleYear);
			var y2 = yearToWindow(lastVisibleYear);
			ctx.moveTo(x, y1);
			ctx.lineTo(x, y2);
			ctx.lineWidth = 10;
			ctx.strokeStyle = "rgba(0,0,0,0.8)";
			ctx.stroke();

			// draw notches
			function drawSteps(w, stepSize) {
				ctx.beginPath();
				var yr;
				var firstVisibleYearNotch = Math.ceil(firstVisibleYear / stepSize) * stepSize;
				for (yr = firstVisibleYearNotch; yr <= lastVisibleYear; yr += stepSize) {
					var y = yearToWindow(yr);
					ctx.moveTo(x-w, y);
					ctx.lineTo(x+w, y);
				}
				ctx.stroke();
			}

			ctx.lineWidth = 1.5;
			drawSteps(10, yearNotch/10);

			ctx.lineWidth = 3;
			drawSteps(15, yearNotch);

			// draw start spot
			var y = yearToWindow(yearStart);
			ctx.beginPath();
			ctx.arc(x,y,15,0,Math.PI*2);
			ctx.fillStyle = "#000";
			ctx.fill();

			var firstVisibleYearMark = Math.floor(firstVisibleYear / yearMark) * yearMark;
			var lastVisibleYearMark = Math.ceil(firstVisibleYear / yearMark) * yearMark;

			var distFirst = Math.abs(firstVisibleYearMark - firstVisibleYear);
			var distLast = Math.abs(lastVisibleYearMark - lastVisibleYear);
			var visibleYearMark = (distFirst < distLast) ? firstVisibleYearMark : lastVisibleYearMark;

			function zeroPad(numDigits,number) {
				var result = (""+number);
				var len = result.length;
				var i;
				for (i=len; i<numDigits; i++) {
					result = "0" + result;
				}
				return result;
			}

			function getYearString(year) {
				s = "";
				year = Math.abs(Math.floor(year));
				while (year) {
					if (year < 1000) {
						s = year.toString() + s;
					}
					else {
						s = "," + zeroPad(3,year % 1000) + s;
					}
					year = Math.floor(year/1000);
				}
				return s;
			}

			var y = Ptero.screen.windowToSpace({
				x: 0,
				y: yearToWindow(visibleYearMark),
			}).y;
			yearTitleBtn.pos.y = y;
			yearSubtitleBtn.pos.y = y;
			yearTitleBtn.text = getYearString(visibleYearMark) + " years ago";
			if (visibleYearMark == -220 * 1000 * 1000) {
				yearSubtitleBtn.text = "Pterosaurs show up.";
			}
			else if (visibleYearMark == -65 * 1000 * 1000) {
				yearSubtitleBtn.text = "Last Pterosaurs die.";
			}
			else if (visibleYearMark == 0) {
				yearTitleBtn.text = "TODAY";
				yearSubtitleBtn.text = "Pterodactyl Attack.";
			}
			else {
				yearSubtitleBtn.text = "";
			}
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
			setReturnPos: setReturnPos,
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

	function resumePreviousScroll() {
		scroll.setReturnPos(scroll.getPos());
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		resumePreviousScroll: resumePreviousScroll,
	};

})();
