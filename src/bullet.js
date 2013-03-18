
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
	lifeTime: 5, // seconds
	update: function update(dt) {
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
	},
	draw: function draw(ctx) {
		var p = Ptero.screen.spaceToScreen(this.pos);
		this.sprite.draw(ctx, this.pos);
	},
};
