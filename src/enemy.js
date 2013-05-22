
Ptero.Enemy = function(makeNewPath) {
	this.makeNewPath = makeNewPath;
	if (makeNewPath) {
		this.path = makeNewPath();
	}

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

	this.init();

	this.life = 0;
};

Ptero.Enemy.fromState = function(state, startTime) {

	startTime = startTime || 0;

	var enemy = new Ptero.Enemy();

	var points = state.points;
	var delta_times = [points[0].t + startTime];

	var i,len=points.length;
	for (i=1; i<len; i++) {
		delta_times.push(points[i].t - points[i-1].t);
	}
	enemy.path = new Ptero.Path(
		Ptero.makeHermiteInterpForObjs(
			points,
			['x','y','z','angle'],
			delta_times));

	return enemy;
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
		this.lockedon = false;

		// update score
		if (Ptero.score) {
			Ptero.score.addPoints(100);
		}
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		// register hit to begin explosion
		this.isHit = true;
		var that = this;

		Ptero.audio.playExplode();
	},
	init: function() {
		this.isHit = false;
		this.isGoingToDie = false;
		this.isDead = false;
		this.randomizeBoom();
	},
	die: function() {
		if (this.makeNewPath) {
			this.path = this.makeNewPath();
			this.life++;
			this.init();
		}
		else {
			this.isDead = true;
		}

		if (this.selected) {
			Ptero.orb.deselectTarget(this);
			this.lockedon = false;
		}
	},
	isHittable: function() {
		if (!this.path.isPresent() || this.isHit) {
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

		if (this.isDead) {
			return;
		}

		else if (this.isHit) {
			// BOOM
			this.boomSprite.update(dt);
			if (this.boomSprite.isDone()) {
				this.die();
			}
		}
		else if (this.path.isDone()) {
			// HIT SCREEN

			//navigator.vibrate && navigator.vibrate(200);
			this.die();
		}
		else {

			// Deselect target if it has gone offscreen
			if (!this.isHittable()) {
				if (this.selected) {
					Ptero.orb.deselectTarget(this);
				}
				this.lockedon = false;
			}

			// FLYING TOWARD SCREEN
			// update position
			if (!this.isRemote) {
				this.path.step(dt);
			}

			// update animation
			this.babySprite.update(dt);
		}
	},
	drawBorder: function(ctx, color) {
		var pos = this.path.pos;
		this.babySprite.drawBorder(ctx, pos, color);
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
			if (this.lockedon) {
				this.babySprite.drawBorder(ctx, pos, "#F0F");
			}
		}

		Ptero.orb.drawCone(ctx,this);
	},
};
