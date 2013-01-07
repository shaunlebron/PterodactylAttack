
Ptero.Bullet = function(x,y,z,xv,yv,zv,v,t,target) {
	this.pos = new Ptero.Vector(x,y,z);
	this.dir = new Ptero.Vector(xv,yv,zv);
	this.v = v;
	this.time = 0;
	this.collideTime = t;
	this.target = target;
};

Ptero.Bullet.prototype = {
	update: function(dt) {
		this.pos.add((new Ptero.Vector).set(this.dir).mul(this.v*dt));
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
