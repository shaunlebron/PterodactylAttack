Ptero.scene_play = (function() {

	var state;

	var isPaused = false;
	function pause() {
		isPaused = true;
		Ptero.pause_menu.enable();
		Ptero.pause_menu.animateIn();
	}
	function unpause() {
		isPaused = false;
		enableControls();
		Ptero.pause_menu.disable();
	}

	var KEY_SPACE = 32;
	var KEY_SHIFT = 16;
	var KEY_CTRL = 17;
	var KEY_ALT = 18;
	var KEY_A = 65;
	var KEY_Z = 90;  

	function enableKeys() {
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	}
	function disableKeys() {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
	}
	function onKeyDown(e) {
		if (e.keyCode == KEY_A) {
			Ptero.orb.toggleDrawCones();
		}
		else if (e.keyCode == KEY_SHIFT) {
			Ptero.executive.slowmo();
		}
		else if (e.keyCode == KEY_Z) {
			if (netBtnEnabled) {
				Ptero.orb.engageNet(true);
			}
			e.preventDefault();
		}
	}
	
	function onKeyUp(e) {
		if (e.keyCode == KEY_SHIFT) {
			Ptero.executive.regmo();
		}
		else if (e.keyCode == KEY_Z) {
			Ptero.orb.engageNet(false);
		}
	}

	var buttonList;

	var pauseBtn;
	var scoreBtn;
	var netLeftBtn, netRightBtn;
	var eggBtns;

	var debugBtn1, debugBtn2;
	var debugBtn1Pressed, debugBtn2Pressed;

	var healthBorderBtn;
	var healthContentBtn;

	function cleanup() {
		Ptero.pause_menu.disable();
		Ptero.bulletpool.clear();
		disableControls();
	}

	function enableControls() {
		pauseBtn.enable();
		if (shouldNetBtnVisible) {
			netBtnEnabled = false;
			enableNetBtn(true);
		}
		if (!Ptero.settings.isTutorialEnabled()) {
			debugBtn1.enable();
			debugBtn2.enable();
		}
		Ptero.orb.init();
		enableKeys();
	}

	function disableControls() {
		buttonList.disable();
		enableNetBtn(false);
		Ptero.orb.disableTouch();
		disableKeys();
	}

	var time;
	function init() {
		isPaused = false;
		makeHud();

		// reset the score
		Ptero.score.reset();

		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_game"]);
		var btns = buttonList.namedButtons;

		debugBtn1Pressed = debugBtn2Pressed = false;
		if (!Ptero.settings.isTutorialEnabled()) {

			function trigger() {
				if (debugBtn1Pressed && debugBtn2Pressed && Ptero.background.isIdle) {
					Ptero.overlord.skipThisWave();
				}
			}

			debugBtn1 = btns["debug1"];
			debugBtn2 = btns["debug2"];
			
			debugBtn1.ontouchstart = function() { debugBtn1Pressed = true; trigger(); };
			debugBtn1.ontouchend   = function() { debugBtn1Pressed = false; };
			debugBtn2.ontouchstart = function() { debugBtn2Pressed = true; trigger(); };
			debugBtn2.ontouchend   = function() { debugBtn2Pressed = false; };
		}

		scoreBtn = btns["score"];
		scoreBtn.shouldDraw = false;

		pauseBtn = btns["pause"];
		pauseBtn.onclick = pause;

		netLeftBtn = btns["netLeft"];
		netRightBtn = btns["netRight"];

		healthBorderBtn = btns["healthBorder"];
		healthBorderBtn.shouldDraw = false;
		healthContentBtn = btns["healthContent"];
		healthContentBtn.shouldDraw = false;
		eggBtns = [];
		var i,len=5;
		for (i=1; i<=len; i++) {
			var b = btns["egg"+i];
			b.shouldDraw = false;
			eggBtns.push(b);
		}

		netLeftBtn.ontouchstart = netRightBtn.ontouchstart = function(x,y) { Ptero.orb.engageNet(true); };
		netLeftBtn.ontouchend   = netRightBtn.ontouchend   = function(x,y) { Ptero.orb.engageNet(false); };
		netLeftBtn.ontouchenter = netRightBtn.ontouchenter = function(x,y) { Ptero.orb.engageNet(true); };
		netLeftBtn.ontouchleave = netRightBtn.ontouchleave = function(x,y) { Ptero.orb.engageNet(false); };

		// create a player to hold player attributes such as health.
		Ptero.player.reset();

		// initialize our clock for internal events
		time = 0;

		// create the overlord to manage the enemies
		Ptero.overlord = Ptero.makeOverlord();
		Ptero.overlord.init();

		// initialize orb
		Ptero.orb.setTargets(Ptero.overlord.enemies);

		// initialize pause menu
		Ptero.pause_menu.init();
	};

	var hud;

	function makeHud() {
		hud = (function(){

			var alpha;
			var timer;
			var shown = {
				"health": true,
				"bounty": true,
				"score": true,
			};

			var health = 0;
			var nextHealth;
			var healthTime = 0;
			var healthColor;
			function updateHealth(dt) {
				healthTime += dt;
				nextHealth = Ptero.player.health;
				var healthSpeed = 2;
				if (health < nextHealth) {
					health = Math.min(nextHealth, health + healthSpeed*dt);
				}
				else {
					health = Math.max(nextHealth, health - healthSpeed*dt);
				}
				healthColor = "#DDD";
				if (Math.floor(healthTime*6) % 2 == 0) {
					if (health < nextHealth) {
						healthColor = "#0F0";
					}
					else if (health > nextHealth) {
						healthColor = "#F00";
					}
					else if (health == 1) {
						healthColor = "#F00";
					}
				}
			}

			function show(name, on) {
				shown[name] = on;
			}

			function hide() {
				alpha = null;
			}

			function fadeIn(t, onDone) {
				state = "fade-in";
				var duration = 0.25;
				var interp = Ptero.makeInterp('linear', [0,1], [0, duration]);
				timer = new Ptero.Timer({
					limit: duration,
					onUpdate: function(dt,t) {
						alpha = interp(t);
					},
					onFinish: function() {
						alpha = 1;
						timer = null;
						onDone && onDone();
					},
				});
			}

			function fadeOut(t, onDone) {
				state = "fade-out";
				var duration = 0.25;
				var interp = Ptero.makeInterp('linear', [1,0], [0, duration]);
				timer = new Ptero.Timer({
					limit: duration,
					onUpdate: function(dt,t) {
						alpha = interp(t);
					},
					onFinish: function() {
						alpha = 0;
						timer = null;
						onDone && onDone();
					},
				});
			}

			function update(dt) {
				timer && timer.update(dt);
				updateHealth(dt);
			}

			function drawHealth(ctx) {
				healthBorderBtn.draw(ctx);
				var pos = healthBorderBtn.pos;
				var b = healthContentBtn.billboard;
				var w = b.w;
				var h = b.h;
				var healthPercent = health / Ptero.player.maxHealth;
				ctx.save();
				b.transform(ctx,pos);
				ctx.fillStyle = "#555";
				ctx.fillRect(0,0,w,h);
				ctx.fillStyle = healthColor;
				ctx.fillRect(0,0, healthPercent * w, h);
				ctx.restore();
			}

			function drawEgg(ctx,color) {
				function egg() {
					ctx.scale(0.98,0.98);
					ctx.translate(-8014,-6764);
					ctx.beginPath();
					ctx.moveTo(8052,6798);
					ctx.bezierCurveTo(8052,6811,8044,6818,8034,6818);
					ctx.bezierCurveTo(8023,6818,8015,6811,8015,6798);
					ctx.bezierCurveTo(8015,6785,8023,6765,8034,6765);
					ctx.bezierCurveTo(8044,6765,8052,6785,8052,6798);
					ctx.closePath();
				}
				egg();
				ctx.lineWidth = 5;
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
				ctx.fillStyle = color;
				ctx.fill();
			}

			function drawEggs(ctx) {
				var bounty = Ptero.bounty;
				var i,len=bounty.size;
				var btn,board;
				for (i=0; i<len; i++) {
					var j = bounty.items[i];
					var isCaught = bounty.caught[i];
					var color = isCaught ? "rgba(0,0,0,0.3)" : bounty.colors[j];

					btn = eggBtns[i];
					board = btn.billboard;
					ctx.save();
					board.transform(ctx, btn.pos);
					if (isCaught) {
						var scale = 0.5;
						ctx.translate(board.w/2, board.h/2);
						ctx.scale(scale,scale);
						ctx.translate(-board.w/2, -board.h/2);
					}
					drawEgg(ctx, color);
					ctx.restore();
				}
			}

			function draw(ctx) {
				if (alpha) {
					ctx.globalAlpha = alpha;
					if (shown["health"]) {
						drawHealth(ctx);
					}
					if (shown["bounty"]) {
						drawEggs(ctx);
					}
					if (shown["score"]) {
						scoreBtn.draw(ctx);
					}
					buttonList.draw(ctx);
					ctx.globalAlpha = 1;
				}
			}

			return {
				show: show,
				hide: hide,
				fadeIn: fadeIn,
				fadeOut: fadeOut,
				update: update,
				draw: draw,
			};
		})();
	}

	function exitTutorial() {
		Ptero.settings.enableTutorial(false);
		Ptero.setScene(Ptero.scene_play);
	}

	function fadeToNextStage(onDone, name) {
		//Play win music for when scene stage changes
		Ptero.audio.play('Ptero_Win_Music');
		hud.fadeOut(1, function() {
			var nextName = name || Ptero.getNextBgName();
			disableControls();
			Ptero.background.exit();
			Ptero.background.playOutTrack();
			Ptero.background.onExitDone = function() {
				setTimeout(function(){
					switchBackground(nextName);
					onDone && onDone();
				}, 1000);
			};
		});
	}

	function switchBackground(name) {
		disableControls();
		state = "intro";
		hud.hide();
		Ptero.orb.init();
		Ptero.orb.setNextOrigin(0,-1);
		Ptero.setBackground(name);
		Ptero.background.startTrack();
		Ptero.background.onIdle = function() {
			enableControls();
			hud.fadeIn(1, function(){
				state = "active";
			});
		};
	}

	function update(dt) {
		if (!isPaused) {
			if (Ptero.player.health <= 0){
				Ptero.setScene(Ptero.scene_gameover);
			}
			else {
				time += dt;
				hud.update(dt);
				if (state == "active") {
					Ptero.orb.update(dt);
					Ptero.bulletpool.deferBullets();
					Ptero.score.update(dt);
				}
				if (state == 'active' || state == 'fade-out') {
					Ptero.overlord.update(dt);
				}
			}
		}
		else {
			Ptero.overlord.update(0);
			Ptero.bulletpool.deferBullets();
			Ptero.pause_menu.update(dt);
		}
	};

	function draw(ctx) {
		if (!isPaused) {
			Ptero.assets.keepExplosionsCached(ctx);
			Ptero.deferredSprites.draw(ctx);
			var point;
			if (Ptero.input.isTouched()) {
				point = Ptero.input.getWindowPoint();
				ctx.fillStyle = "rgba(255,255,255,0.2)";
				ctx.beginPath();
				ctx.arc(point.x, point.y, 30, 0, 2*Math.PI);
				ctx.fill();
			}

			scoreBtn.text = Ptero.score.getScoreStr();

			hud.draw(ctx);

			if (state == "active") {
				Ptero.orb.draw(ctx);
			}
			if (state == 'active' || state == 'fade-out') {
				Ptero.overlord.draw(ctx);
			}
		}
		else {
			Ptero.deferredSprites.draw(ctx);
			Ptero.pause_menu.draw(ctx);
		}

	};

	var shouldNetBtnVisible = false;
	function setNetBtnVisible(on) {
		shouldNetBtnVisible = on;
	}
	var netBtnEnabled = false;
	function enableNetBtn(on) {
		netBtnEnabled = on;

		netLeftBtn.disable();
		netRightBtn.disable();
		netLeftBtn.shouldDraw = netRightBtn.shouldDraw = false;

		var side = Ptero.settings.getNetSide();
		if (on) {
			if (side == 'left') {
				netLeftBtn.enable();
				netLeftBtn.shouldDraw = true;
			}
			else if (side == 'right') {
				netRightBtn.enable();
				netRightBtn.shouldDraw = true;
			}
		}
	}

	return {
		getHud: function () { return hud; },
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		enableNetBtn: enableNetBtn,
		setNetBtnVisible: setNetBtnVisible,
		isNetBtnEnabled: function() { return netBtnEnabled; },
		pause: pause,
		unpause: unpause,
		fadeToNextStage: fadeToNextStage,
		switchBackground: switchBackground,
		exitTutorial: exitTutorial,
	};
})();
