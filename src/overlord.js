// An overlord manages a list of enemies by spawning and destroying them.

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
		console.log('next delay time',t);
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
