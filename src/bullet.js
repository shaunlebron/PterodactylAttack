
Ptero.Bullet = function() {
	this.pos = new Ptero.Vector;
	this.dir = new Ptero.Vector;
	this.speed = 0;
	this.time = 0;
	this.collideTime = null;
	this.collideTarget = null;
};

Ptero.Bullet.prototype = {
	update: function update(dt) {
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
	},
	draw: function draw(ctx) {
		var p = Ptero.screen.spaceToScreen(this.pos);
		ctx.beginPath();
		var closeWidth = this.getSpaceRadius();
		var scale = Ptero.screen.getFrustum().getDepthScale(this.pos.z, closeWidth) / closeWidth;
		ctx.arc(p.x,p.y,this.getRadius()*scale,0,Math.PI*2);
		ctx.fillStyle = "#f00";
		ctx.fill();
	},
	getRadius: function getRadius() {
		return Ptero.screen.getHeight()/12;
	},
	getSpaceRadius: function getSpaceRadius() {
		return this.getRadius() / Ptero.screen.getScreenToSpaceRatio();
	},
};
