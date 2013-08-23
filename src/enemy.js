// "Ptero.enemyTypes" is now automatically defined in assets.js after loading the ptero anims.

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

	// time to flash white (used to indicate when this enemy is hit)
	this.flashTime = 0;

	this.pointsEarned = 0;
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
	enemy.path = enemy.attackPath = new Ptero.Path(
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
		if (this.typeName.match(/^adult/)) {
			this.whiteSprite = Ptero.assets.makeAnimSprite('adult_white');
		}
		else {
			this.whiteSprite = Ptero.assets.makeAnimSprite('baby_white');
		}

		this.whiteSprite.time = this.sprite.time;
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
	explode: function() {
		// register hit to begin explosion
		this.isHit = true;
		if (Ptero.score) {
			Ptero.score.addPoints(this.pointsEarned*2);
			Ptero.score.addKills(1);
		}
		this.health = 0;
		Ptero.audio.playExplode();
	},
	applyDamage: function(damage) {
		if (this.health <= 0) {
			return;
		}
		this.health -= damage;

		if (this.health <= 0) {
			this.explode();
		}
		else {
			Ptero.audio.playHurt();

			this.flashTime = 0.1;
		}
	},
	createCaptureAndReleasePaths: function() {
		// get current position (should be from the attackPath)
		var currentPos = this.getPosition();

		var frustum = Ptero.frustum;
		
		var p0 = {
			x: currentPos.x,
			y: currentPos.y,
			z: currentPos.z,
		};
		var p1 = {
			x: p0.x,
			y: p0.y+frustum.nearHeight/2,
			z: p0.z,
		};
		var t1 = 0.25;
		var p2 = {
			x: frustum.nearLeft*2,
			y: 0,
			z: frustum.near,
		};
		var t2 = 0.5;
		p2 = frustum.projectToZ(p2, p0.z);

		this.capturePath = new Ptero.Path(
			Ptero.makeHermiteInterpForObjs(
				[p0,p1,p2],
				['x','y','z'],
				[0,t1,t2]));

		this.releasePath = new Ptero.Path(
			Ptero.makeHermiteInterpForObjs(
				[p2,p0],
				['x','y','z'],
				[0,1]));
	},
	release: function() {
		this.isCaught = false;
		this.path = this.releasePath;
	},
	onHit: function onHit(damage) {
		if (!this.isHittable()) {
			return;
		}
		this.whenHit && this.whenHit();

		// this variable was set to eliminate the targetting of an object already struck
		this.lockedon = false;

		if (damage < 0) {
			// negative damage is arbitrarily used to signal a capture
			Ptero.audio.playNet();
			this.createCaptureAndReleasePaths();
			this.path = this.capturePath;
			if (Ptero.score) {
				Ptero.score.addHits(1);
			}
		}
		else {
			// update score
			if (Ptero.score) {
				var p = 100;
				Ptero.score.addPoints(p);
				this.pointsEarned += p;
				Ptero.score.addHits(1);
			}

			this.applyDamage(damage);
		}
	},
	init: function() {
		this.health = this.typeData.health;

		// might want to refactor into a state machine to better manage the state indicated by these variabes:
		this.isHit = false;
		this.isGoingToDie = false;
		this.isDead = false;
		this.isCaught = false;

		// active path
		this.path = this.attackPath;

		// available paths
		this.capturePath = null;
		this.releasePath = null;

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
		if (!this.path.isPresent() || this.isHit || this.path == this.capturePath) {
			return false;
		}

		var billboard = this.getBillboard();
		var pos = this.getPosition();
		var rect = billboard.getSpaceRect(pos);
		var frustum = Ptero.frustum;
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

			// update flash time (hit indicator)
			this.flashTime = Math.max(0, this.flashTime-dt);

			if (this.path.isDone()) {
				if (this.path == this.attackPath) {
					// HIT SCREEN
					if (this.isAttack) {
						Ptero.player.applyDamage(this.typeData.damage);
						this.onAttack && this.onAttack();
					}
					this.die();
				}
				else if (this.path == this.capturePath) {
					if (!this.isCaught) {
						Ptero.bounty.addEnemy(this);
						this.onCaught && this.onCaught();
						this.isCaught = true;
					}
				}
				else if (this.path == this.releasePath) {
					this.path = this.attackPath;
				}
			}
			else {
				if (this.path == this.capturePath) {
					// freeze animation while ptero is being captured
				}
				else {
					// update animation
					this.sprite.update(dt);
					this.whiteSprite.update(dt);
				}
			}
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
			if (this.flashTime) {
				this.whiteSprite.draw(ctx, pos);
			}
			else {
				this.sprite.draw(ctx, pos);
			}
			if (this.selected) {
				this.sprite.drawBorder(ctx, pos, "#0FF");
			}
			if (this.lockedon) {
				this.sprite.drawBorder(ctx, pos, "#F0F");
			}
			if (this.path == this.capturePath) {
				var sprite = Ptero.assets.sprites["netbullet"];
				sprite.draw(ctx, pos);
			}
		}

		Ptero.orb.drawCone(ctx,this);
	},
};
