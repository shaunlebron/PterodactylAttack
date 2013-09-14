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

	this.lessonTitleBtn = btns["title"];
	this.lessonSubBtn = btns["subtitle"];

	this.msgBtn = btns["message"];

	this.arrowBtn = btns["arrow"];
	this.netHelpBtn1 = btns["nethelp1"];
	this.netHelpBtn2 = btns["nethelp2"];
	this.netHelpBtn3 = btns["nethelp3"];
	this.arrowBtn2 = btns["arrow2"];
	this.netHelpBtn4 = btns["nethelp4"];
	this.netHelpBtn5 = btns["nethelp5"];
	this.netHelpBtn6 = btns["nethelp6"];

	Ptero.orb.enableGuide(true);
};

Ptero.OverlordTutor.prototype = {
	refreshPaths: function() {
		this.paths = Ptero.background.pteroPaths;
	},
	showLessonTitle: function(title,subtitle,fade) {
		this.lessonTitleBtn.text = title;
		this.lessonSubBtn.text = subtitle;

		var that = this;
		this.lessonTitle = (function(){
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

			function update(dt) {
				driver.step(dt);
				if (driver.isDone()) {
					that.netTutor = null;
				}
			}
			function draw(ctx) {
				var val = driver.val;
				if (val) {
					ctx.save();
					ctx.translate(0, val.offset);
					ctx.globalAlpha = val.alpha;


					var side = Ptero.settings.getNetSide();
					if (side == "left") {
						that.arrowBtn.draw(ctx);
						that.netHelpBtn1.draw(ctx);
						that.netHelpBtn2.draw(ctx);
						that.netHelpBtn3.draw(ctx);
					}
					else if (side == "right") {
						that.arrowBtn2.draw(ctx);
						that.netHelpBtn4.draw(ctx);
						that.netHelpBtn5.draw(ctx);
						that.netHelpBtn6.draw(ctx);
					}
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
			that.showLessonTitle('Lesson 1','Hit babies 2 times','out');
			setTimeout(function() {
				that.createLesson2Script();
			}, 500);
		}

		function addBaby() {
			var baby = that.createRandomEnemy({age:'baby'});
			baby.onDie = function() {
				end();
				Ptero.audio.play('bountyCorrect');
			};
			baby.onAttack = function() {
				addBaby();
				Ptero.audio.play('bountyWrong');
			};
			that.enemies.push(baby);
		}

		that.showLessonTitle('Lesson 1','Hit babies 2 times','in');
		addBaby();
	},
	createLesson2Script: function() {
		var that = this;

		function end() {
			that.showLessonTitle('Lesson 2','Hit adults 3 times','out');
			setTimeout(function() {
				that.createLesson3Script();
			}, 500);
		}

		function addAdult() {
			var adult = that.createRandomEnemy({age:'adult'});
			adult.onDie = function() {
				Ptero.audio.play('bountyCorrect');
				end();
			};
			adult.onAttack = function() {
				addAdult();
				Ptero.audio.play('bountyWrong');
			};
			that.enemies.push(adult);
		}

		that.showLessonTitle('Lesson 2','Hit adults 3 times','in');
		addAdult();
	},
	createLesson3Script: function() {
		var that = this;

		function end() {
			that.showLessonTitle('Lesson 3','Capture a pterodactyl','out');
			that.showNetTutor('out');
		}

		function addPtero() {
			var p = that.createRandomEnemy();
			p.onCaught = function () {
				Ptero.audio.play('bountyCorrect');
				end();
			};
			p.onDie = function() {
				Ptero.audio.play('bountyWrong');
				addPtero();
			};
			p.onAttack = function() {
				Ptero.audio.play('bountyWrong');
				addPtero();
			};
			that.enemies.push(p);
		}

		Ptero.bounty.isBlackHole = true;
		Ptero.scene_play.enableNet(true);
		that.showLessonTitle('Lesson 3','Capture a pterodactyl','in');
		that.showNetTutor('in');
		addPtero();
	},
	init: function() {
		console.log('initing tutor');
		Ptero.player.setGod(true);
		Ptero.scene_play.switchBackground('tutorial');
		Ptero.scene_play.enableNet(false);
		Ptero.scene_play.hud.show("score", false);
		Ptero.scene_play.hud.show("health", false);
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
	},
	update: function(dt) {
		this.message && this.message.update(dt);
		this.lessonTitle && this.lessonTitle.update(dt);
		this.netTutor && this.netTutor.update(dt);

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
			that.waveNum = waveNum;
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

		// empty enemies list
		this.enemies.length = 0;
		this.refreshPaths();
		Ptero.refreshBounty();
		this.waitingForTheEnd = false;
		this.waveTitle = null;

		this.script.init();
	},
	draw: function(ctx) {
		this.waveTitle && this.waveTitle.draw(ctx);
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
				this.waitingForTheEnd = false;
				this.showWaveTitle("WAVE COMPLETE!");
				Ptero.scene_play.fadeToNextStage(function(){
					that.createWaveScript(that.waveNum + 1);
					that.init();
				});
			}
		}
	},
};
