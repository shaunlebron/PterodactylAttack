
Ptero.FadeScene = function(scene1, scene2, timeToFade) {
	this.scene1 = scene1;
	this.scene2 = scene2;
	this.scene2.init();
	this.interp = Ptero.makeInterp('linear',[1,0],[timeToFade]);
	this.time = 0;
};

Ptero.FadeScene.prototype = {
	update: function(dt) {
		this.time += dt;
		if (this.time > this.interp.totalTime) {
			Ptero.scene = this.scene2;
		}
	},
	draw: function(ctx) {
		this.scene2.draw(ctx);
		ctx.globalAlpha = this.interp(this.time);
		this.scene1.draw(ctx);
		ctx.globalAlpha = 1;
	},
};
