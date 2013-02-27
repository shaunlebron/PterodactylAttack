
Ptero.Enemy = function(makePath) {
	this.makePath = makePath;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.babySprite.update(Math.random()*this.babySprite.totalDuration);

	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);
	this.randomizeBoom();

	this.resetPosition();
};

Ptero.Enemy.prototype = {
	randomizeBoom: function randomizeBoom() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
		this.boomSprite.restart();
	},
	isHittable: function isHittable() {
		return !this.path.isDone() && !this.isHit; // only hittable if not already hit
	},
	getPosition: function getPosition() {
		return this.path.pos;
	},
	getCollisionRadius: function getCollisionRadius() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time);
	},
	onHit: function onHit() {
		// update score
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		this.isHit = true;
		var that = this;
	},
	resetPosition: function resetPosition() {
		this.randomizeBoom();
		this.path = this.makePath();
		this.isHit = false;
		this.isGoingToDie = false;
	},
	update: function update(dt) {
		var millis = dt*1000;

		// update position of quad object
		// quadObject.setPos(path.state.pos);

		if (this.isHit) {
			// BOOM
			this.boomSprite.update(dt);
			if (this.boomSprite.isDone()) {
				this.resetPosition();
			}
		}
		else if (this.path.isDone()) {
			// HIT SCREEN

			navigator.vibrate && navigator.vibrate(200);
			this.resetPosition();
		}
		else {
			// FLYING TOWARD SCREEN
			// update position
			this.path.step(dt);

			// update animation
			this.babySprite.update(dt);
		}
	},
	getSize: function() {
		return this.babySprite.sheet.tileWidth;
	},
	draw: function draw(ctx) {
		var pos = this.path.pos;

		if (this.isHit) {
			this.boomSprite.draw3D(ctx, pos, this.highlight);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.draw3D(ctx, pos, this.highlight);
		}

	},
};
