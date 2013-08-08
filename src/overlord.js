// An overlord manages a list of enemies by spawning and destroying them.

Ptero.getMountainPaths = function() {
	return [
		Ptero.assets.json["mountain_path00"],
		Ptero.assets.json["mountain_path01"],
		Ptero.assets.json["mountain_path02"],
		Ptero.assets.json["mountain_path03"],
		Ptero.assets.json["mountain_path04"],
		Ptero.assets.json["mountain_path05"],
		Ptero.assets.json["mountain_path06"],
		Ptero.assets.json["mountain_path07"],
		Ptero.assets.json["mountain_path08"],
		Ptero.assets.json["mountain_path09"],
	];
};

Ptero.makeOverlord = function() {
	var paths = Ptero.getMountainPaths();
	return new Ptero.OverlordPattern(paths);
};

//////////////////////////////////////////////////////////////////////////////

Ptero.OverlordPattern = function(paths) {
	this.paths = paths;
	this.enemies = [];
	this.createScript();
};

Ptero.OverlordPattern.prototype = {
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
			[5, 2],
			[5, 3],
			[5, 4],
			[5, 5],
			[5, 6],
			[5, 7],
			[5, 8],
			[5, 9],
			[5, 10],
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

		this.script.update(dt);

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
