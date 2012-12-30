
Ptero.Enemy = function() {
	this.path = Ptero.makeEnemyPath();
	this.isHit = false;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);
	this.randomizeBoom();

	this.doneTimer = new Ptero.Timer(1000);

	this.setTimeBomb();
};

Ptero.Enemy.prototype = {
	setTimeBomb: function() {
		this.bombTimer = new Ptero.Timer((Math.random()*10 + 3)*1000);
	},
	randomizeBoom: function() {
		this.boomSprite = (Math.random() < 0.5 ? this.boom1Sprite : this.boom2Sprite);
		this.boomSprite.restart();
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
		this.isHit = true;
		var that = this;
	},
	resetPosition: function() {
		this.randomizeBoom();
		this.path = Ptero.makeEnemyPath();
		this.isHit = false;
		this.doneTimer.reset();
		this.setTimeBomb();
	},
	update: function(dt) {
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

			if (this.doneTimer.getElapsedMillis() == 0) {
				navigator.vibrate && navigator.vibrate(200);
				// Screen.shakeScreen(1000);
			}
			this.doneTimer.increment(millis);
			if (this.doneTimer.isDone()) {
				this.resetPosition();
			}
		}
		else {
			// FLYING TOWARD SCREEN
			this.bombTimer.increment(millis);
			if (this.bombTimer.isDone()) {
				this.onHit();
			}
			else {
				// update position
				this.path.step(dt);

				// update animation
				this.babySprite.update(dt);
			}
		}
	},
	draw: function(ctx) {
		var pos = this.path.state.pos;

		// this is the scale of the image when it is on the near plane.
		var screenWidth = this.boomSprite.sheet.tileWidth;

		// this is the apparent scale resulting from its depth.
		var scale = Ptero.screen.getFrustum().getDepthScale(pos.z, screenWidth) / screenWidth;

		var screenPos = Ptero.screen.spaceToScreen(pos.x, pos.y, pos.z);

		if (this.isHit) {
			this.boomSprite.drawCentered(ctx, screenPos.x, screenPos.y, scale);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.drawCentered(ctx, screenPos.x, screenPos.y, scale);
		}
	},
};
