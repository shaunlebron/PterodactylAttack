
Ptero.Enemy = function(makeNewPath) {
	this.makeNewPath = makeNewPath;

	this.babySprite = new Ptero.AnimSprite({table:Ptero.assets.tables.baby});
	this.babySprite.shuffleTime();

	this.boom1Sprite = new Ptero.AnimSprite({mosaic:Ptero.assets.mosaics.boom1});
	this.boom1Sprite.setRepeat(false);
	this.boom2Sprite = new Ptero.AnimSprite({mosaic:Ptero.assets.mosaics.boom2});
	this.boom2Sprite.setRepeat(false);
	this.boom3Sprite = new Ptero.AnimSprite({mosaic:Ptero.assets.mosaics.boom3});
	this.boom3Sprite.setRepeat(false);

	this.boomSprites = [
		this.boom1Sprite,
		this.boom2Sprite,
		this.boom3Sprite,
	];
	this.randomizeBoom();

	this.resetPosition();

	this.life = 0;
};

Ptero.Enemy.prototype = {
	randomizeBoom: function randomizeBoom() {
		var numBooms = this.boomSprites.length;
		var i = Math.floor(Math.random()*numBooms);
		this.boomSprite = this.boomSprites[i];
		this.boomSprite.restart();
	},
	getPosition: function getPosition() {
		return this.path.pos;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time);
	},
	getTimeLeftInPath: function() {
		return this.path.totalTime - this.path.time;
	},
	getBillboard: function() {
		return this.babySprite.getBillboard();
	},
	onHit: function onHit() {
		if (!this.isHittable()) {
			return;
		}

		// update score
		Ptero.score.addPoints(100);
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		this.isHit = true;
		var that = this;
	},
	resetPosition: function resetPosition() {
		this.randomizeBoom();
		if (this.makeNewPath) {
			this.path = this.makeNewPath();
		}
		this.isHit = false;
		this.isGoingToDie = false;
		if (this.selected) {
			Ptero.orb.deselectTarget(this);
		}
		this.life++;
	},
	isHittable: function() {
		if (this.path.isDone() || this.isHit) {
			return false;
		}

		var billboard = this.getBillboard();
		var pos = this.getPosition();
		var rect = billboard.getSpaceRect(pos);
		var frustum = Ptero.screen.getFrustum();
		return (
			frustum.isInside(rect.bl) ||
			frustum.isInside(rect.br) ||
			frustum.isInside(rect.tl) ||
			frustum.isInside(rect.tr)
		);
	},
	update: function update(dt) {

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
			if (this.selected && !this.isHittable()) {
				Ptero.orb.deselectTarget(this);
			}

			// FLYING TOWARD SCREEN
			// update position
			this.path.step(dt);

			// update animation
			this.babySprite.update(dt);
		}
	},
	draw: function draw(ctx) {
		var pos = this.path.pos;

		if (this.isHit) {
			this.boomSprite.draw(ctx, pos);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.babySprite.draw(ctx, pos);
			if (this.selected) {
				this.babySprite.drawBorder(ctx, pos, "#0FF");
			}
		}

		Ptero.orb.drawCone(ctx,this);
	},
};
