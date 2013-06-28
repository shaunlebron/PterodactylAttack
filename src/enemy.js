Ptero.enemyTypes = {
	"baby": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby",
	},
	"baby_green": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby_green",
	},
	"baby_pink": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby_pink",
	},
	"baby_purple": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby_purple",
	},
	"baby_teal": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby_teal",
	},
	"baby_yellow": {
		"health": 1,
		"damage": 1,
		"spriteName": "baby_yellow",
	},
	"adult": {
		"health": 2,
		"damage": 1,
		"spriteName": "adult",
	},
	"adult_red": {
		"health": 2,
		"damage": 1,
		"spriteName": "adult_red",
	},
	"adult_purple": {
		"health": 2,
		"damage": 1,
		"spriteName": "adult_purple",
	},
	"adult_green": {
		"health": 2,
		"damage": 1,
		"spriteName": "adult_green",
	},
	"adult_yellowstripe": {
		"health": 2,
		"damage": 1,
		"spriteName": "adult_yellowstripe",
	},
	"adult_greenspot": {
		"health": 3,
		"damage": 1,
		"spriteName": "adult_greenspot",
	},
	"adult_pink": {
		"health": 3,
		"damage": 1,
		"spriteName": "adult_pink",
	},
	"adult_redspot": {
		"health": 3,
		"damage": 1,
		"spriteName": "adult_redspot",
	},
	"adult_yellow": {
		"health": 3,
		"damage": 1,
		"spriteName": "adult_yellow",
	},
};

Ptero.Enemy = function() {

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

	this.setType("baby");

	this.init();

	this.life = 0;
};

Ptero.Enemy.fromState = function(state, startTime) {

	startTime = startTime || 0;

	var enemyType = state.enemyType;
	var isAttack = state.isAttack;

	if (enemyType == null) {
		enemyType = "baby";
	}
	if (isAttack == null) {
		isAttack = false;
	}

	var enemy = new Ptero.Enemy();
	enemy.setType(enemyType);
	enemy.isAttack = isAttack;

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
	makeAnimSprite: function() {
		var sprite = Ptero.assets.makeAnimSprite(this.typeData.spriteName);
		sprite.shuffleTime();
		return sprite;
	},
	setType: function(type) {
		this.typeName = type;
		this.typeData = Ptero.enemyTypes[type];

		this.health = this.typeData.health;

		this.sprite = this.makeAnimSprite();
	},
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
		return this.sprite.getBillboard();
	},
	applyDamage: function(damage) {
		if (this.health <= 0) {
			return;
		}
		this.health -= damage;

		if (this.health <= 0) {

			// register hit to begin explosion
			this.isHit = true;
			Ptero.audio.playExplode();
		}
		else {
			Ptero.audio.playHurt();
		}
	},
	onHit: function onHit(damage) {
		if (!this.isHittable()) {
			return;
		}
		this.whenHit && this.whenHit();

		this.lockedon = false;

		// update score
		if (Ptero.score) {
			Ptero.score.addPoints(100);
		}
		// scene.score += 100 + scene.getStreakBonus();
		// scene.streakCount++;

		this.applyDamage(damage);
	},
	init: function() {
		this.health = this.typeData.health;
		this.isHit = false;
		this.isGoingToDie = false;
		this.isDead = false;
		this.randomizeBoom();
	},
	die: function() {
		this.isDead = true;

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
				this.afterHit && this.afterHit();
			}
		}
		else if (this.path.isDone()) {
			// HIT SCREEN
			if (this.isAttack) {
				Ptero.player.applyDamage(this.typeData.damage);
			}

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
			this.sprite.update(dt);
		}
	},
	drawBorder: function(ctx, color) {
		var pos = this.path.pos;
		this.sprite.drawBorder(ctx, pos, color);
	},
	draw: function draw(ctx) {
		var pos = this.path.pos;

		if (this.isHit) {
			this.boomSprite.draw(ctx, pos);
		}
		else if (this.path.isDone()) {
		}
		else {
			this.sprite.draw(ctx, pos);
			if (this.selected) {
				this.sprite.drawBorder(ctx, pos, "#0FF");
			}
			if (this.lockedon) {
				this.sprite.drawBorder(ctx, pos, "#F0F");
			}
		}

		Ptero.orb.drawCone(ctx,this);
	},
};
