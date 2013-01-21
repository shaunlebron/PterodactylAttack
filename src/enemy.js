
Ptero.Enemy = function() {
	this.path = Ptero.makeEnemyPath();
	this.isHit = false;

	this.babySprite = new Ptero.AnimSprite(Ptero.assets.sheets.baby);
	this.babySprite.update(Math.random()*this.babySprite.totalDuration);

	this.boom1Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom1);
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite(Ptero.assets.sheets.boom2);
	this.boom2Sprite.setRepeat(false);
	this.randomizeBoom();

	this.doneTimer = new Ptero.Timer(1000);
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
		return this.path.state.pos;
	},
	getCollisionRadius: function getCollisionRadius() {
		return Ptero.sizeFactor * 2;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time).pos;
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
		this.path = Ptero.makeEnemyPath();
		this.isHit = false;
		this.doneTimer.reset();
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
		var pos = this.path.state.pos;

		// This is the width of the image when it is on the near plane.
		// It is multiplied to match the scale of the background.
		var closeWidth = this.boomSprite.sheet.tileWidth * Ptero.background.getScale();

		// This is the apparent scale resulting from its depth.
		var scale = Ptero.screen.getFrustum().getDepthScale(pos.z, closeWidth) / closeWidth;

		var screenPos = Ptero.screen.spaceToScreen(pos);

		if (this.isHit) {
			this.boomSprite.drawCentered(ctx, screenPos.x, screenPos.y, scale, this.highlight);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.drawCentered(ctx, screenPos.x, screenPos.y, scale, this.highlight);
		}

	},
};
