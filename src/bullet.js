
Ptero.Bullet = function() {
	this.pos = new Ptero.Vector;
	this.dir = new Ptero.Vector;
	this.speed = 0;
	this.time = 0;
	this.collideTime = null;
	this.collideTarget = null;
};

Ptero.Bullet.prototype = {
	update: function(dt) {
		this.pos.add(this.dir.copy().mul(this.speed*dt));
		this.time += dt;
	},
	draw: function(ctx) {
		var p = Ptero.screen.spaceToScreen(this.pos);
		ctx.beginPath();
		ctx.arc(p.x,p.y,this.getRadius(),0,Math.PI*2);
		ctx.fillStyle = "#f00";
		ctx.fill();
	},
	getRadius: function() {
		return Ptero.screen.getHeight()/12;
	},
};
