Ptero.BulletSmoke = function(pos) {
	this.pos = pos;
	this.radius = 100;
	var r = this.radius;
	this.billboard = new Ptero.Billboard(r,r,2*r,2*r,1);
	this.time = 0;
	this.timeLimit = 2.0;
	
	var angle = Math.random()*Math.PI*2;
	var speed = Ptero.screen.getFrustum().nearHeight * Math.random();
	this.vx = Math.cos(angle) * speed;
	this.vz = Math.sin(angle) * speed;
	this.vy = Ptero.screen.getFrustum().nearHeight;
};

Ptero.BulletSmoke.prototype = {
	update: function(dt) {
		this.time += dt;
		this.pos.x += dt * this.vx;
		this.pos.y += dt * this.vy;
		this.pos.z += dt * this.vz;
	},
	isDone: function() {
		return this.time > this.timeLimit;
	},
	draw: function(ctx) {
		ctx.save();
		this.billboard.transform(ctx,this.pos);

		var scale = 0.5;
		var alpha = scale * (1 - Math.min(1,this.time/this.timeLimit));
		alpha = Math.max(0,Math.min(scale,alpha));

		var r = this.radius;
		var grey = 255;
		ctx.fillStyle = "rgba("+grey+","+grey+","+grey+","+alpha+")";
	
		/*
		ctx.beginPath();
		ctx.arc(r,r,r,0,Math.PI*2);
		ctx.fill();
		*/

		ctx.fillRect(0,0,2*r,2*r);

		ctx.restore();
	},
};

Ptero.Bullet = function() {
	this.pos = new Ptero.Vector;
	this.dir = new Ptero.Vector;
	this.speed = 0;
	this.time = 0;
	this.collideTime = null;
	this.collideTarget = null;
	this.sprite = Ptero.assets.sprites.bullet;

	this.prevPos = null;
};

Ptero.Bullet.prototype = {
	lifeTime: 3, // seconds
	update: function update(dt) {
		if (this.time < 0.05) {
			if (!this.prevPos) {
				this.prevPos = this.pos.copy();
			}
		}
		else {
			this.prevPos.add(this.dir.copy().mul(this.speed*dt));
		}
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
		if (this.isDone()) {
			this.prevPos = null;
		}
	},
	draw: function draw(ctx) {
		this.sprite.draw(ctx, this.pos);
		if (this.prevPos) {
			var r0 = this.sprite.billboard.getScreenRect(this.pos);
			var r1 = this.sprite.billboard.getScreenRect(this.prevPos);
			ctx.beginPath();
			ctx.moveTo(r0.x, r0.centerY);
			ctx.lineTo(r0.x+r0.w, r0.centerY);
			ctx.lineTo(r1.x+r1.w, r1.centerY);
			ctx.lineTo(r1.x, r1.centerY);
			ctx.closePath();
			ctx.fillStyle = "rgba(255,0,0,0.25)";
			ctx.fill();
		}
	},
	isDone: function() {
		return (
			this.time > this.lifeTime ||
			this.collideTarget && this.time > this.collideTime
		);
	},
	getPosition: function() {
		return this.pos;
	},
};

Ptero.PathBullet = function(path) {
	this.path = path;
	this.sprite = Ptero.assets.mosaics["missile"];

	this.smokeTime = 0;
	this.smokeTimeLimit = 0.01;
};

Ptero.PathBullet.prototype = {
	update: function(dt) {
		//this.smokeTime += dt;
		if (this.path.pos) {
			//if (this.smokeTime > this.smokeTimeLimit) {
			//	this.smokeTime = 0;
			//	Ptero.smokepool.add(this.path.pos);
			//}
			this.dir = this.path.pos.copy();
		}
		else {
			this.dir = null;
		}
		this.path.step(dt);
		if (this.dir && this.path.pos) {
			this.dir.sub(this.path.pos);
		}
		else {
			this.dir = null;
		}
	},
	getScreenAngle: function(ctx) {
		if (!this.dir) {
			return null;
		}
		var pos = this.path.pos.copy();
		var dir = this.dir.copy();
		var screenPos1 = Ptero.screen.spaceToScreen(pos);
		var pos2 = pos.copy().sub(dir);
		var screenPos2 = Ptero.screen.spaceToScreen(pos2);
		var dx = screenPos1.x - screenPos2.x;
		var dy = screenPos1.y - screenPos2.y;

		/*
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#F0F";
		Ptero.painter.moveTo(ctx, pos);
		Ptero.painter.lineTo(ctx, pos2);
		ctx.stroke();
		*/

		return -Math.atan2(dx,dy);
	},
	draw: function(ctx) {
		var angle = this.getScreenAngle(ctx);
		if (angle == null) {
			return;
		}
		var pos = this.path.pos.copy();
		pos.angle = angle;
		this.sprite.draw(ctx, pos, "quarter");

	},
	isDone: function() {
		return this.path.isDone();
	},
	getPosition: function() {
		return this.path.pos;
	},
};
