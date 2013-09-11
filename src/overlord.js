// An overlord manages a list of enemies by spawning and destroying them.

Ptero.makeOverlord = function() {
	if (Ptero.settings.isTutorialEnabled()) {
		Ptero.scene_play.enableNet(false);
		return new Ptero.OverlordTutor();
	}
	else {
		Ptero.scene_play.enableNet(true);
		return new Ptero.OverlordWaves();
	}
};

//////////////////////////////////////////////////////////////////////////////
Ptero.OverlordTutor = function() {
	this.enemies = [];
	this.stopped = false;
	this.refreshPaths();
};

Ptero.OverlordTutor.prototype = {
	refreshPaths: function() {
		this.paths = Ptero.background.pteroPaths;
	},
	draw: function(ctx) {
		this.drawSign && this.drawSign(ctx);
	},
	createRandomEnemy: function(d) {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType;
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
	init: function() {
		// create first enemy and attached event to kick off next checkpoint
		var that = this;
		this.checkpoint = 0;

		this.signTime = 0;
		this.signLen = 3;

		this.checkpoints = [
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut1'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn babies 1 by 1 until hit
				// "KILL THE BABY PTERODACTYL!"
				var enemy = that.createRandomEnemy({age:'baby'});
				enemy.onAttack = function() {
					exec();
				};
				enemy.afterHit = function() {
					that.checkpoint += 1;
					exec();
				};
				that.enemies.push(enemy);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut2'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn adults 1 by 1 until hit
				// "KILL THE BIG PTERODACTYL!"
				var enemy = that.createRandomEnemy({age:'adult'});
				enemy.onAttack = function() {
					exec();
				};
				enemy.afterHit = function() {
					that.checkpoint += 1;
					exec();
				};
				that.enemies.push(enemy);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, 1500);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_tut3'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				// spawn 1 baby and 1 adult until hit
				// "KILL THE GROUP OF PTERODACTYLS!"
				var enemies = [
					that.createRandomEnemy({age:'baby'}),
					that.createRandomEnemy({age:'adult'}),
					that.createRandomEnemy({age:'baby'}),
					that.createRandomEnemy({age:'adult'}),
				];
				var i,len=enemies.length;
				var numKilled = 0;
				var endTotal = 0;
				function onEnd(isKilled) {
					endTotal += 1;
					if (isKilled) {
						numKilled += 1;
					}
					if (numKilled == len) {
						that.checkpoint += 1;
						exec();
					}
					else if (endTotal == len) {
						exec();
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(true); };
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*i);
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, 1500);
			},
			//function() {
			//	that.signTime = that.signLen;
			//	that.drawSign = function(ctx) {
			//		var s = Ptero.assets.sprites['msg_tut4'];
			//		var pos = {
			//			x: 0,
			//			y: 0,
			//			z: Ptero.frustum.near,
			//		};
			//		s.draw(ctx, pos);
			//	};
			//	setTimeout(function(){
			//		that.checkpoint += 1;
			//		exec();
			//	}, that.signTime*1000);
			//},
			(function(){
				var first = true;
				return function() {
					that.drawSign = function(ctx) {
						var s = Ptero.assets.mosaics['msg_helpnet'];
						var pos = {
							x: 0,
							y: 0,
							z: Ptero.frustum.near,
						};
						s.draw(ctx, pos, "help");
						if (!first) {
							s = Ptero.assets.sprites['msg_tryagain'];
							pos.y += 0.1;
							s.draw(ctx, pos);
						}
					};
					setTimeout(function(){
						that.checkpoint += 1;
						first = false;
						that.drawSign = null;
						exec();
					}, that.signLen*1000);
					Ptero.scene_play.enableNet(true);

					var bounty = new Ptero.Bounty();
					Ptero.bounty = bounty;
					var babyIndex = 0;
					var adultIndex = 2;
					bounty.setItems([babyIndex,adultIndex]);
				};
			})(),
			function() {
				// "CAPTURE THE PTERODACTYLS TO GAIN HEALTH!"

				var babyIndex = 0;
				var adultIndex = 2;
				var enemies = [
					that.createRandomEnemy({colorIndex:babyIndex}),
					that.createRandomEnemy({colorIndex:adultIndex}),
				];
				
				var i,len=enemies.length;
				var endTotal = 0;
				var numCaught = 0;
				function onEnd(isCaught) {
					endTotal += 1;
					if (isCaught) {
						numCaught += 1;
					}
					if (numCaught == len) {
						that.checkpoint += 1;
						exec();
					}
					else if (endTotal == len) {
						that.checkpoint -= 1;
						exec();
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(false); };
					enemies[i].onCaught = function() { onEnd(true); };
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*(i+1));
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			//function() {
			//	that.signTime = that.signLen;
			//	that.drawSign = function(ctx) {
			//		var s = Ptero.assets.sprites['msg_tut5'];
			//		var pos = {
			//			x: 0,
			//			y: 0,
			//			z: Ptero.frustum.near,
			//		};
			//		s.draw(ctx, pos);
			//	};
			//	setTimeout(function(){
			//		that.checkpoint += 1;
			//		exec();
			//	}, that.signTime*1000);

			//	var bounty = new Ptero.Bounty();
			//	Ptero.bounty = bounty;
			//	var bountyIndexes = [2,3];
			//	bounty.setItems(bountyIndexes);

			//},
			(function(){

				var first = true;
				return function() {
					var bounty = new Ptero.Bounty();
					Ptero.bounty = bounty;
					var bountyIndexes = [2,3];
					bounty.setItems(bountyIndexes);

					that.drawSign = function(ctx) {
						var s = Ptero.assets.mosaics['msg_helpbounty'];
						var pos = {
							x: 0,
							y: 0,
							z: Ptero.frustum.near,
						};
						s.draw(ctx, pos, "help");
						if (!first) {
							s = Ptero.assets.sprites['msg_tryagain'];
							pos.y += 0.1;
							s.draw(ctx, pos);
						}
					};
					setTimeout(function(){
						that.checkpoint += 1;
						first = false;
						that.drawSign = null;
						exec();
					}, that.signLen*1000);
				};
			})(),
			function() {
				// "CAPTURE THE CORRECT PTERODACTYLS!"

				var indexes = [ 0,1,2,3 ];
				var i,len=indexes.length;
				var enemies = [];
				for (i=0; i<len; i++) {
					enemies.push(that.createRandomEnemy({colorIndex:i}));
				}
				
				var endTotal = 0;
				var numCaught = 0;
				var bountyLen = 2;
				function onEnd(isCaught) {
					endTotal += 1;
					console.log(isCaught);
					if (isCaught) {
						numCaught += 1;
					}
					if (endTotal == len) {
						if (numCaught == bountyLen) {
							that.checkpoint += 1;
							exec();
						}
						else {
							that.checkpoint -= 1;
							exec();
						}
					}
				}
				for (i=0; i<len; i++) {
					enemies[i].onAttack = function() { onEnd(false); };
					enemies[i].afterHit = function() { onEnd(false); };
					if (i >= 2) {
						enemies[i].onCaught = function() { onEnd(true); };
					}
					setTimeout((function(enemy){
						return function() {
							that.enemies.push(enemy);
						};
					})(enemies[i]),2000*(i+1));
				}
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_complete'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					that.checkpoint += 1;
					that.drawSign = null;
					exec();
				}, that.signLen*1000);
			},
			function() {
				that.drawSign = function(ctx) {
					var s = Ptero.assets.sprites['msg_ready'];
					var pos = {
						x: 0,
						y: 0,
						z: Ptero.frustum.near,
					};
					s.draw(ctx, pos);
				};
				setTimeout(function(){
					Ptero.settings.enableTutorial(false);
					that.drawSign = null;
					Ptero.refreshBounty();
					Ptero.overlord = Ptero.makeOverlord();
					Ptero.orb.setTargets(Ptero.overlord.enemies);
				}, that.signLen*1000);
			},
		];

		function exec() {
			console.log('checkpoint '+that.checkpoint);
			that.checkpoints[that.checkpoint]();
		}
		setTimeout(exec, 2000);
	},
	stopScript: function() {
		this.stopped = true;
	},
	update: function(dt) {

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
		// empty enemies list
		this.enemies.length = 0;
		this.refreshPaths();
		Ptero.refreshBounty();
		this.waitingForTheEnd = false;

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
				Ptero.scene_play.fadeToNextStage(function(){
					that.createWaveScript(that.waveNum + 1);
					that.init();
				});
			}
		}
	},
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordPattern = function(paths) {
	this.paths = paths;
	this.enemies = [];
	this.createScript();
	this.stopped = false;
};

Ptero.OverlordPattern.prototype = {
	draw: function(ctx) {
	},
	stopScript: function() {
		this.stopped = true;
	},
	createScript: function() {

		var t = 0;
		var events = [];
		var that = this;
		function addEnemy(num) {
			if (num==undefined) {
				num = 1;
			}
			var i;
			for (i=0; i<num; i++) {
				that.enemies.push(that.createRandomEnemy());
			}
		}
		function addEvent(dt,action) {
			t += dt;
			events.push({ time: t, action: action });
		}
		function addLineup(waves) {
			var i,len=waves.length;
			var j;
			for (i=0; i<len; i++) {
				var w = waves[i];
				var dt = w[0];
				var count = w[1];

				addEvent(dt, addEnemy);

				dt = 0.75;
				for (j=1; j<count; j++) {
					addEvent(dt, addEnemy);
				}
			}
		}

		addLineup([
			[2, 1],
			[3, 2],
			[4, 3],
			[5, 4],
			[6, 5],
			[5, 6],
			[9, 2],
			[3, 3],
			[6, 4],
			[2, 8],
			[3, 3],
		]);

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
		// empty enemies list
		this.enemies.length = 0;

		this.script.init();
	},
	update: function(dt) {

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
	},
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordRandom = function(paths) {
	this.paths = paths;
	this.enemies = [];
};

Ptero.OverlordRandom.prototype = {
	draw: function(ctx) {
	},
	createRandomEnemy: function(age) {
		var enemyNames = Ptero.bounty.enemyNames;
		var enemyType;
		if (age == 'baby') {
			enemyType = enemyNames[Math.floor(Math.random()*2)];
		}
		else if (age == 'adult') {
			enemyType = enemyNames[Math.floor(Math.random()*2)+2];
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
	getNextDelayTime: function() {
		var max = 7;
		var min = 2;
		var t = Math.floor(Math.random()*(max-min))+min;
		return t;
	},
	init: function() {
		// empty enemies list
		this.enemies.length = 0;

		// refresh countdown to enemy release
		this.time = this.getNextDelayTime();
	},
	update: function(dt) {

		this.time -= dt;
		if (this.time <= 0) {
			// add random enemy
			this.enemies.push(this.createRandomEnemy());
			
			// refresh countdown to enemy release
			this.time = this.getNextDelayTime();
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
