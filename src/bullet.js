
Ptero.Bullet = function() {
	this.pos = new Ptero.Vector;
	this.dir = new Ptero.Vector;
	this.speed = 0;
	this.time = 0;
	this.collideTime = null;
	this.collideTarget = null;
	this.sprite = Ptero.assets.sprites.bullet;
};

Ptero.Bullet.prototype = {
	lifeTime: 3, // seconds
	update: function update(dt) {
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
	},
	draw: function draw(ctx) {
		this.sprite.draw(ctx, this.pos);
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
	this.sprite = Ptero.assets.sprites.bullet;
};

Ptero.PathBullet.prototype = {
	update: function(dt) {
		this.path.step(dt);
	},
	draw: function(ctx) {
		this.sprite.draw(ctx, this.path.pos);
	},
	isDone: function() {
		return this.path.isDone();
	},
	getPosition: function() {
		return this.path.pos;
	},
};
