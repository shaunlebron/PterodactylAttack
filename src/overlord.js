// An overlord manages a list of enemies by spawning and destroying them.

Ptero.makeOverlord = function() {
	if (Ptero.settings.isTutorialEnabled()) {
		return new Ptero.OverlordTutor();
	}
	else {
		return new Ptero.OverlordWaves();
	}
};

//////////////////////////////////////////////////////////////////////////////
Ptero.OverlordTutor = function() {
	this.enemies = [];
	this.stopped = false;


	var buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_tutorial"]);
	var btns = buttonList.namedButtons;

	this.lessonTitleBtn   = btns["title"];
	this.lessonSubBtn     = btns["subtitle"];
	this.msgBtn           = btns["message"];
	this.leftNetArrowBtn  = btns["leftNetArrow"];
	this.leftNetMsg1Btn   = btns["leftNetMsg1"];
	this.leftNetMsg2Btn   = btns["leftNetMsg2"];
	this.leftNetMsg3Btn   = btns["leftNetMsg3"];
	this.rightNetArrowBtn = btns["rightNetArrow"];
	this.rightNetMsg1Btn  = btns["rightNetMsg1"];
	this.rightNetMsg2Btn  = btns["rightNetMsg2"];
	this.rightNetMsg3Btn  = btns["rightNetMsg3"];
	this.bountyArrowBtn   = btns["bountyArrow"];
	this.bountyMsg1Btn    = btns["bountyMsg1"];
	this.bountyMsg2Btn    = btns["bountyMsg2"];
	this.healthMsgBtn     = btns["healthMsg"];
	this.skipArrowBtn     = btns["skipArrow"];
	this.skipMsg1Btn      = btns["skipMsg1"];
	this.skipMsg2Btn      = btns["skipMsg2"];

	Ptero.orb.enableGuide(true);
};

Ptero.OverlordTutor.prototype = {
	refreshPaths: function() {
		this.paths = Ptero.background.pteroPaths;
	},
	showLessonTitle: function(title,subtitle) {
		this.lessonTitleBtn.text = title;
		this.lessonSubBtn.text = subtitle;

		var that = this;
		function makeLessonTitle(fade) {
			var radius = 70;
			var transitionTime = 0.1;
			var stayTime = 2;
			var vals;
			if (fade == 'in') {
				vals = [
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
				];
			}
			else if (fade == 'out') {
				vals = [
					{ 'offset': 0      , 'alpha': 1 , } ,
					{ 'offset': radius , 'alpha': 0 , } ,
				];
			}
			var interp = Ptero.makeInterpForObjs('linear',
				vals,
				['offset', 'alpha'],
				[0, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);
			if (fade == 'in') {
				driver.freezeAtEnd = true;
			}

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.lessonTitle = null;
				}
			}
			function draw(ctx) {
				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;
					that.lessonTitleBtn.draw(ctx);
					that.lessonSubBtn.draw(ctx);
					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				update: update,
				draw: draw,
			};
		}
		this.lessonTitle = makeLessonTitle("in")
		this.lessonTitle.fadeOut = function() {
			that.lessonTitle = makeLessonTitle("out");
		};
	},
	showBountyTutor: function(fade) {
		var that = this;
		this.bountyTutor = (function(){
			var radius = 70;
			var transitionTime = 0.1;
			var vals;
			if (fade == 'in') {
				vals = [
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
				];
			}
			else if (fade == 'out') {
				vals = [
					{ 'offset': 0      , 'alpha': 1 , } ,
					{ 'offset': radius , 'alpha': 0 , } ,
				];
			}
			var interp = Ptero.makeInterpForObjs('linear',
				vals,
				['offset', 'alpha'],
				[0, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);
			if (fade == 'in') {
				driver.freezeAtEnd = true;
			}

			var shouldShow = true;
			function show(on) {
				shouldShow = on;
			}

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.bountyTutor = null;
				}
			}
			function draw(ctx) {
				if (!shouldShow) {
					return;
				}

				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;

					that.bountyArrowBtn.draw(ctx);
					that.bountyMsg1Btn.draw(ctx);
					that.bountyMsg2Btn.draw(ctx);

					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				update: update,
				draw: draw,
				show: show,
			};
		})();
	},
	showSkipTutor: function(fade) {
		var that = this;
		this.skipTutor = (function(){
			var radius = 70;
			var transitionTime = 0.1;
			var vals;
			if (fade == 'in') {
				vals = [
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
				];
			}
			else if (fade == 'out') {
				vals = [
					{ 'offset': 0      , 'alpha': 1 , } ,
					{ 'offset': radius , 'alpha': 0 , } ,
				];
			}
			var interp = Ptero.makeInterpForObjs('linear',
				vals,
				['offset', 'alpha'],
				[0, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);
			if (fade == 'in') {
				driver.freezeAtEnd = true;
			}

			var shouldShow = true;
			function show(on) {
				shouldShow = on;
			}

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.skipTutor = null;
				}
			}
			function draw(ctx) {
				if (!shouldShow) {
					return;
				}

				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;

					that.skipArrowBtn.draw(ctx);
					that.skipMsg1Btn.draw(ctx);
					that.skipMsg2Btn.draw(ctx);

					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				update: update,
				draw: draw,
				show: show,
			};
		})();
	},
	showNetTutor: function(fade) {
		var that = this;
		this.netTutor = (function(){
			var radius = 70;
			var transitionTime = 0.1;
			var vals;
			if (fade == 'in') {
				vals = [
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
				];
			}
			else if (fade == 'out') {
				vals = [
					{ 'offset': 0      , 'alpha': 1 , } ,
					{ 'offset': radius , 'alpha': 0 , } ,
				];
			}
			var interp = Ptero.makeInterpForObjs('linear',
				vals,
				['offset', 'alpha'],
				[0, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);
			if (fade == 'in') {
				driver.freezeAtEnd = true;
			}

			var shouldShow = true;
			function show(on) {
				shouldShow = on;
			}

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.netTutor = null;
				}
			}
			function draw(ctx) {
				if (!shouldShow) {
					return;
				}

				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;


					var side = Ptero.settings.getNetSide();
					if (side == "left") {
						that.leftNetArrowBtn.draw(ctx);
						that.leftNetMsg1Btn.draw(ctx);
						that.leftNetMsg2Btn.draw(ctx);
						that.leftNetMsg3Btn.draw(ctx);
					}
					else if (side == "right") {
						that.rightNetArrowBtn.draw(ctx);
						that.rightNetMsg1Btn.draw(ctx);
						that.rightNetMsg2Btn.draw(ctx);
						that.rightNetMsg3Btn.draw(ctx);
					}
					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				show: show,
				update: update,
				draw: draw,
			};
		})();
	},
	showMessage: function(text) {
		this.msgBtn.text = text;
		var that = this;
		this.message = (function(){
			var radius = 70;
			var transitionTime = 0.1;
			var stayTime = 2;
			var interp = Ptero.makeInterpForObjs('linear',
				[
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
					{ 'offset': radius  , 'alpha': 0 , }
				],
				['offset', 'alpha'],
				[0, transitionTime, stayTime, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.message = null;
				}
			}
			function draw(ctx) {
				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;
					that.msgBtn.draw(ctx);
					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				update: update,
				draw: draw,
			};
		})();
	},
	createRandomEnemy: function(d) {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType;
		d = d || {};
		if (d.age == 'baby') {
			enemyType = enemyNames[Math.floor(Math.random()*2)];
		}
		else if (d.age == 'adult') {
			enemyType = enemyNames[Math.floor(Math.random()*2)+2];
		}
		else if (d.colorIndex != null) {
			enemyType = enemyNames[d.colorIndex];
		}
		else {
			enemyType = enemyNames[Math.floor(Math.random()*enemyNames.length)];
		}
		var path = this.paths[Math.floor(Math.random()*this.paths.length)];
		return this.createEnemy(path,enemyType);
	},
	createEnemy: function(path, enemyType) {
		var state = {
			isAttack: true,
			enemyType: enemyType,
			points: path.models[0].points,
		};
		return Ptero.Enemy.fromState(state);
	},
	createLesson1Script: function() {
		var that = this;

		function end() {
			that.lessonTitle.fadeOut();
			that.script.addEventAfterNow({
				time: 0.5,
				action: function() {
					that.createLesson2Script();
				},
			});
		}

		function die() {
			that.isShowHealthMsg = false;
			that.enemies.length = 0;
			Ptero.audio.play('bountyWrong');
			Ptero.scene_play.enableNet(false);
			Ptero.scene_play.hud.show('health', false);
			that.lessonTitle.fadeOut();

			Ptero.orb.setNextOrigin(0,-2);
			Ptero.orb.disableTouch();

			that.script.addEventsAfterNow([
				{
					time: 0.7,
					action: function() {
						that.showMessage('You Died. Try again.');
					},
				},
				{
					dt: 2.5,
					action: revive,
				},
			]);
		}

		function revive() {
			Ptero.orb.setNextOrigin(0,-1);
			Ptero.orb.enableTouch();
			that.createLesson1Script();
		}

		function addBaby() {
			var baby = that.createRandomEnemy({age:'baby'});
			baby.onDie = function() {
				end();
				Ptero.audio.play('bountyCorrect');
			};
			baby.onAttack = function() {
				if (Ptero.player.health <= 0) {
					Ptero.player.reset();
					die();
				}
				else {
					Ptero.audio.play('bountyWrong');
					that.script.addEventAfterNow({
						time: 0.5,
						action: addBaby,
					});
				}
			};
			that.enemies.push(baby);
		}

		this.script = new Ptero.TimedScript([
			{
				time: 0,
				action: function() {
					that.showLessonTitle('Lesson 1','Hit babies 2 times');
					Ptero.scene_play.hud.show("health", true);
					Ptero.scene_play.hud.show("bounty", false);
					that.isShowHealthMsg = true;
				},
			},
			{
				dt: 0.5,
				action: function() {
					Ptero.orb.setNextOrigin(0,-1);
				}
			},
			{
				dt: 1,
				action: addBaby,
			},
		]);
	},
	createLesson2Script: function() {
		var that = this;

		function end() {
			that.lessonTitle.fadeOut();
			that.script.addEventAfterNow({
				time: 0.5,
				action: function() {
					that.createLesson3Script();
				},
			});
		}

		function die() {
			that.isShowHealthMsg = false;
			that.enemies.length = 0;
			Ptero.audio.play('bountyWrong');
			Ptero.scene_play.enableNet(false);
			Ptero.scene_play.hud.show('health', false);
			Ptero.scene_play.hud.show('bounty', false);
			that.lessonTitle.fadeOut();

			Ptero.orb.setNextOrigin(0,-2);
			Ptero.orb.disableTouch();

			that.script.addEventsAfterNow([
				{
					time: 0.7,
					action: function() {
						that.showMessage('You Died. Try again.');
					},
				},
				{
					dt: 2.5,
					action: revive,
				},
			]);
		}

		function revive() {
			Ptero.orb.setNextOrigin(0,-1);
			Ptero.orb.enableTouch();
			that.createLesson2Script();
		}

		function addAdult() {
			var adult = that.createRandomEnemy({age:'adult'});
			adult.onDie = function() {
				Ptero.audio.play('bountyCorrect');
				end();
			};
			adult.onAttack = function() {
				if (Ptero.player.health <= 0) {
					Ptero.player.reset();
					die();
				}
				else {
					Ptero.audio.play('bountyWrong');
					that.script.addEventAfterNow({
						time: 0.5,
						action: addAdult,
					});
				}
			};
			that.enemies.push(adult);
		}

		this.script = new Ptero.TimedScript([
			{
				time: 0,
				action: function() {
					that.showLessonTitle('Lesson 2','Hit adults 3 times');
					Ptero.scene_play.hud.show("health", true);
					Ptero.scene_play.hud.show("bounty", false);
					that.isShowHealthMsg = true;
				},
			},
			{
				dt: 1,
				action: addAdult,
			},
		]);
	},
	createLesson3Script: function() {
		var that = this;

		function end() {
			that.lessonTitle.fadeOut();
			that.showNetTutor('out');
			that.script.addEventAfterNow({
				time: 0.5,
				action: function() {
					that.createLesson4Script();
				},
			});
		}

		function die() {
			that.isShowHealthMsg = false;
			that.enemies.length = 0;
			Ptero.audio.play('bountyWrong');
			Ptero.scene_play.enableNet(false);
			Ptero.scene_play.hud.show('health', false);
			Ptero.scene_play.hud.show('bounty', false);
			that.lessonTitle.fadeOut();
			that.showNetTutor('out');

			Ptero.orb.setNextOrigin(0,-2);
			Ptero.orb.disableTouch();

			that.script.addEventsAfterNow([
				{
					time: 0.7,
					action: function() {
						that.showMessage('You Died. Try again.');
					},
				},
				{
					dt: 2.5,
					action: revive,
				},
			]);
		}

		function revive() {
			Ptero.orb.setNextOrigin(0,-1);
			Ptero.orb.enableTouch();
			that.createLesson3Script();
		}

		function addPtero() {
			var p = that.createRandomEnemy();
			function spawnNextPtero(delay) {
				function on() {
					that.netTutor.show(true);
				}
				function off() {
					that.netTutor.show(false);
				}
				var i,count=4;
				var dt = 0.1;
				var events = [
					{ time: delay, action: off },
					{ dt: dt, action: on},
				];
				for (i=0; i<count-1; i++) {
					events.push({ dt: dt, action: off });
					events.push({ dt: dt, action: on });
				}
				events.push({
					dt: 0.5,
					action: addPtero,
				});
				that.script.addEventsAfterNow(events);
			}
			p.onCaught = function () {
				Ptero.audio.play('bountyCorrect');
				end();
			};
			p.onDie = function() {
				Ptero.audio.play('bountyWrong');
				spawnNextPtero(0);
			};
			p.onAttack = function() {
				if (Ptero.player.health <= 0) {
					Ptero.player.reset();
					die();
				}
				else {
					Ptero.audio.play('bountyWrong');
					spawnNextPtero(1);
				}
			};
			that.enemies.push(p);
		}

		this.script = new Ptero.TimedScript([
			{
				time: 0,
				action: function() {
					Ptero.bounty.isBlackHole = true;
					that.showLessonTitle('Lesson 3','Capture a pterodactyl');
					Ptero.scene_play.hud.show("health", true);
					Ptero.scene_play.hud.show("bounty", false);
					that.isShowHealthMsg = true;
				},
			},
			{
				dt: 0.75,
				action: function() {
					Ptero.scene_play.enableNet(true);
					that.showNetTutor('in');
				},
			},
			{
				dt: 0.75,
				action: addPtero,
			},
		]);
	},
	createLesson4Script: function() {
		var that = this;

		function end() {
			that.lessonTitle.fadeOut();
			that.showBountyTutor('out');
			that.showSkipTutor('out');
			that.script.addEventsAfterNow([
				{
					time: 1,
					action: function() {
						that.showMessage("Now, get out there!");
						Ptero.orb.setNextOrigin(0,-2);
						Ptero.scene_play.cleanup();
						Ptero.settings.enableTutorial(false);
						Ptero.scene_play.hud.fadeOut(1, function() {
							Ptero.background.exit();
							Ptero.background.onExitDone = function() {
								setTimeout(function(){
									Ptero.setScene(Ptero.scene_play);
								}, 1000);
							};
						});
					},
				},
				{
					dt: 1,
					action: function() {
					},
				},
			]);
		}

		function die() {
			that.enemies.length = 0;
			Ptero.audio.play('bountyWrong');
			Ptero.scene_play.enableNet(false);
			Ptero.scene_play.hud.show('health', false);
			Ptero.scene_play.hud.show('bounty', false);
			that.lessonTitle.fadeOut();
			that.showBountyTutor('out');
			that.showSkipTutor('out');

			Ptero.orb.setNextOrigin(0,-2);
			Ptero.orb.disableTouch();

			that.script.addEventsAfterNow([
				{
					time: 0.7,
					action: function() {
						that.showMessage('You Died. Try again.');
					},
				},
				{
					dt: 2.5,
					action: revive,
				},
			]);
		}

		function revive() {
			Ptero.orb.setNextOrigin(0,-1);
			Ptero.orb.enableTouch();
			that.createLesson4Script();
		}

		var pteroIndex = 0;
		function addPtero() {
			var p = that.createRandomEnemy({colorIndex:pteroIndex});
			function spawnNextPtero(delay) {
				that.script.addEventAfterNow({
					time: delay,
					action: addPtero,
				});
			}
			function flashBountyTutor(delay) {
				function on() {
					that.bountyTutor.show(true);
				}
				function off() {
					that.bountyTutor.show(false);
				}
				var i,count=4;
				var dt = 0.1;
				var events = [
					{ time: delay, action: off },
					{ dt: dt, action: on},
				];
				for (i=0; i<count-1; i++) {
					events.push({ dt: dt, action: off });
					events.push({ dt: dt, action: on });
				}
				that.script.addEventsAfterNow(events);
			}
			function flashBountyTutorAndSpawnNextPtero(delay) {
				function on() {
					that.bountyTutor.show(true);
				}
				function off() {
					that.bountyTutor.show(false);
				}
				var i,count=4;
				var dt = 0.1;
				var events = [
					{ time: delay, action: off },
					{ dt: dt, action: on},
				];
				for (i=0; i<count-1; i++) {
					events.push({ dt: dt, action: off });
					events.push({ dt: dt, action: on });
				}
				events.push({
					dt: 0.5,
					action: addPtero,
				});
				that.script.addEventsAfterNow(events);
			}
			p.triggeredSpawn = false;
			p.onMiscatch = function() {
				flashBountyTutor(0.5);
			};
			p.onCaught = function () {
				if (Ptero.bounty.isComplete()) {
					end();
				}
				else {
					p.triggeredSpawn = true;
					spawnNextPtero(0.5);
				}
			};
			p.onDie = function() {
				if (Ptero.bounty.isEnemyDesired(p)) {
					Ptero.audio.play('bountyWrong');
				}
				if (!p.triggeredSpawn) {
					if (Ptero.bounty.isEnemyDesired(p)) {
						flashBountyTutorAndSpawnNextPtero(0);
					}
					else {
						spawnNextPtero(0.5);
					}
				}
			};
			p.onAttack = function() {
				if (Ptero.player.health <= 0) {
					Ptero.player.reset();
					die();
				}
				else {
					if (!p.triggeredSpawn) {
						spawnNextPtero(1);
					}
				}
			};
			that.enemies.push(p);

			pteroIndex = (pteroIndex+1)%4;
		}

		this.script = new Ptero.TimedScript([
			{
				time: 0,
				action: function() {
					Ptero.bounty.setItems([0,2]);
					Ptero.bounty.autoReset = false;
					Ptero.player.setGod(false);
					Ptero.bounty.isBlackHole = false;
					Ptero.scene_play.enableNet(true);
					Ptero.scene_play.hud.show("health", true);
					Ptero.scene_play.hud.show("bounty", false);
					that.isShowHealthMsg = false;
					that.showLessonTitle('Last Lesson','Bounties');
				},
			},
			{
				dt: 0.75,
				action: function() {
					Ptero.scene_play.hud.show('bounty', true);
					that.showBountyTutor('in');
				},
			},
			{
				dt: 0.75,
				action: function() {
					that.showSkipTutor('in');
				},
			},
			{
				dt: 0.75,
				action: addPtero,
			},
		]);
	},
	init: function() {
		console.log('initing tutor');
		Ptero.player.setGod(false);
		Ptero.scene_play.switchBackground('tutorial');
		Ptero.orb.setOrigin(0,-2);
		Ptero.orb.setNextOrigin(0,-2);
		Ptero.scene_play.enableNet(false);
		Ptero.scene_play.hud.show("score", false);
		Ptero.scene_play.hud.show("health", false);
		Ptero.scene_play.hud.show("bounty", false);
		this.refreshPaths();
		Ptero.refreshBounty();
		this.message = null;

		this.createLesson1Script();
	},
	stopScript: function() {
		this.stopped = true;
	},
	draw: function(ctx) {
		this.message && this.message.draw(ctx);
		this.lessonTitle && this.lessonTitle.draw(ctx);
		this.netTutor && this.netTutor.draw(ctx);
		this.bountyTutor && this.bountyTutor.draw(ctx);
		this.skipTutor && this.skipTutor.draw(ctx);
		this.isShowHealthMsg && this.healthMsgBtn.draw(ctx);
	},
	update: function(dt) {
		this.message && this.message.update(dt);
		this.lessonTitle && this.lessonTitle.update(dt);
		this.netTutor && this.netTutor.update(dt);
		this.bountyTutor && this.bountyTutor.update(dt);
		this.skipTutor && this.skipTutor.update(dt);

		if (!this.stopped) {
			this.script && this.script.update(dt);
		}

		// update enemies
		var e,pos;
		var i,len=this.enemies.length;
		for (i=0; this.enemies[i];) {
			e = this.enemies[i];
			if (e.isDead) {
				// remove enemy if needed
				this.enemies.splice(i,1);
			}
			else {
				e.update(dt);
				pos = e.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(e) {
							return function(ctx){
								e.draw(ctx);
							};
						})(e),
						pos.z);
				}
				i++;
			}
		}
	},
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordWaves = function() {
	this.enemies = [];
	this.stopped = false;

	this.waveNum = 0;
	this.showWaveNum = false;

	this.createWaveScript(0);

	var buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_wave"]);
	this.waveBtn = buttonList.namedButtons["wave"];

	Ptero.scene_play.switchBackground('mountain');
	Ptero.orb.enableGuide(false);
};

Ptero.OverlordWaves.prototype = {
	refreshPaths: function() {
		this.paths = Ptero.background.pteroPaths;
	},
	showWaveTitle: function(text) {
		this.waveBtn.text = text;
		var that = this;
		this.waveTitle = (function(){
			var radius = 70;
			var transitionTime = 0.1;
			var stayTime = 2;
			var interp = Ptero.makeInterpForObjs('linear',
				[
					{ 'offset': -radius , 'alpha': 0 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
					{ 'offset': 0       , 'alpha': 1 , } ,
					{ 'offset': radius  , 'alpha': 0 , }
				],
				['offset', 'alpha'],
				[0, transitionTime, stayTime, transitionTime]);

			var driver = new Ptero.InterpDriver(interp);

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.waveTitle = null;
				}
			}
			function draw(ctx) {
				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;
					that.waveBtn.draw(ctx);
					ctx.globalAlpha = 1;
					ctx.restore();
				}
			}
			return {
				update: update,
				draw: draw,
			};
		})();
	},
	stopScript: function() {
		this.stopped = true;
	},
	createWaveScript: function(waveNum) {
		this.waveNum = waveNum;

		var t = 0;
		var events = [];
		var that = this;

		// add a number of enemies to the screen
		function addEnemy(num) {
			if (num==undefined) {
				num = 1;
			}
			var i;
			for (i=0; i<num; i++) {
				that.enemies.push(that.createRandomEnemy());
			}
		}

		// add an action to the event list
		function addEvent(dt,action) {
			t += dt;
			events.push({ time: t, action: action });
		}

		// Show wave count
		addEvent(0, function() {
			that.showWaveTitle("wave " + (waveNum+1).toString());
			Ptero.score.addWaves(1);
		});

		// the time to wait between each ptero group
		var groupWaitTime = (function(){
			// wait time will decrease to a certain floor

			var waveCap = 12;
			var maxWait = 3;
			var minWait = 1;
			var waitRange = maxWait - minWait;

			var k = Math.min(waveNum,waveCap) / waveCap;

			return maxWait - waitRange * k;

		})();

		// the time to wait between each ptero in a ptero group
		var pteroWaitTime = (function(){

			var waveCap = 12;
			var maxWait = 1.0;
			var minWait = 0.1;
			var waitRange = maxWait - minWait;

			var k = Math.min(waveNum,waveCap) / waveCap;

			return maxWait - waitRange * k;
		})();

		// the number of pteros in the initial group
		var groupStart = (function(){
			return Math.floor(waveNum/3) + 1;
		})();

		// the number of pteros added to each subsequent group
		var groupGrowth = (function(){
			var w = waveNum % 3;
			return [2,3,4][w];
		})();

		// the number of ptero groups in this wave
		var numGroups = (function(){
			return 5;
		})();

		console.log('WAVE',waveNum+1);
		console.log('group wait time',groupWaitTime);
		console.log('ptero wait time',pteroWaitTime);
		console.log('group start',groupStart);
		console.log('group growth',groupGrowth);
		console.log('num groups', numGroups);

		// create the ptero events
		var i,j,groupCount;
		groupCount = groupStart;
		for (i=0; i<numGroups; i++) {
			addEvent(groupWaitTime, addEnemy);
			for (j=1; j<groupCount; j++) {
				addEvent(pteroWaitTime, addEnemy);
			}
			groupCount += groupGrowth;
		}

		// add event to advance to next wave
		addEvent(5, function() {
			that.waitingForTheEnd = true;
		});

		// create the script to execute the timed events
		this.script = new Ptero.TimedScript(events);
	},
	createRandomEnemy: function() {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType = enemyNames[Math.floor(Math.random()*enemyNames.length)];
		var path = this.paths[Math.floor(Math.random()*this.paths.length)];
		return this.createEnemy(path,enemyType);
	},
	createEnemy: function(path, enemyType) {
		var state = {
			isAttack: true,
			enemyType: enemyType,
			points: path.models[0].points,
		};
		return Ptero.Enemy.fromState(state);
	},
	init: function() {

		Ptero.player.setGod(false);

		Ptero.scene_play.enableNet(true);
		Ptero.scene_play.hud.show("score", true);
		Ptero.scene_play.hud.show("health", true);
		Ptero.scene_play.hud.show("bounty", true);

		// empty enemies list
		this.enemies.length = 0;
		this.refreshPaths();
		this.waitingForTheEnd = false;
		this.waveTitle = null;

		Ptero.bountySize = Math.min(5, this.waveNum+2);
		Ptero.refreshBounty();

		this.script.init();
	},
	draw: function(ctx) {
		this.waveTitle && this.waveTitle.draw(ctx);
	},
	skipThisWave: function() {
		this.enemies.length = 0;
		this.triggerNextWave();
	},
	triggerNextWave: function() {
		var that = this;
		this.waitingForTheEnd = false;
		Ptero.scene_play.fadeToNextStage(function(){
			that.createWaveScript(that.waveNum + 1);
			that.init();
		});
	},
	update: function(dt) {
		this.waveTitle && this.waveTitle.update(dt);

		if (!this.stopped) {
			this.script.update(dt);
		}

		// update enemies
		var e,pos;
		var i,len=this.enemies.length;
		for (i=0; this.enemies[i];) {
			e = this.enemies[i];
			if (e.isDead) {
				// remove enemy if needed
				this.enemies.splice(i,1);
			}
			else {
				e.update(dt);
				pos = e.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(e) {
							return function(ctx){
								e.draw(ctx);
							};
						})(e),
						pos.z);
				}
				i++;
			}
		}

		// end the wave when appropriate
		if (this.waitingForTheEnd) {
			var that = this;
			function readyToEnd() {
				var i,len=that.enemies.length;
				for (i=0; i<len; i++) {
					if (!that.enemies[i].isCaught) {
						return false;
					}
				}
				return true;
			}
			if (readyToEnd()) {
				this.showWaveTitle("WAVE COMPLETE!");
				this.triggerNextWave();
			}
		}
	},
};
