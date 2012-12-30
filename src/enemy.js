
Ptero.Enemy = function() {
	this.path = Ptero.makeEnemyPath();
	this.isHit = false;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);

	this.doneTimer = new Timer(1000);
};

Ptero.Enemy.prototype = {
	randomizeBoom: function() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
	},
	isHittable: function() {
		return !this.path.isDone() && !this.isHit; // only hittable if not already hit
	},
	getPosition: function() {
		return this.path.state.pos;
	},
	getCollisionRadius: function() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function(time) {
		return this.path.seek(time).pos;
	},
	onHit: function() {
		// update score
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		isHit = true;
		this.randomizeBoom();
		var that = this;
		this.boomSprite.setFinishCallback(function() {
			that.resetPosition();
		});
	},
	resetPosition: function() {
		this.path = Ptero.makeEnemyPath();
		this.isHit = false;
	},
	update: function(dt) {
		var millis = dt*1000;

		// update position of quad object
		// quadObject.setPos(path.state.pos);

		if (this.isHit) {
			// BOOM
			this.boomSprite.update(dt);
		}
		else if (this.path.isDone()) {
			// HIT SCREEN

			if (this.doneTimer.getElapsedMillis() == 0) {
				navigator.vibrate && navigator.vibrate(200);
				// Screen.shakeScreen(1000);
			}
			this.doneTimer.increment(millis);
			if (this.doneTimer.isDone()) {
				this.doneTimer.reset();
				this.resetPosition();
			}
		}
		else {
			// FLYING TOWARD SCREEN

			// update position
			this.path.step(dt);

			// update animation
			this.babySprite.update(dt);
		}
	},
	draw: function(ctx) {
	},
};
