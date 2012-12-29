
Ptero.Enemy = function() {
	this.scaleDir = 1;
	this.minScale = 0.01;
	this.maxScale = 0.8;
	this.scaleRange = (this.maxScale - this.minScale);
	this.scale = Math.random()*this.scaleRange + this.minScale;

	var screen_w = Ptero.screen.width;
	var screen_h = Ptero.screen.height;
	this.x = (Math.random()*screen_w);
	this.y = (Math.random()*screen_h);

	var babySheet = Ptero.assets.sheets.baby;
	this.sprite = new Ptero.AnimSprite(babySheet, 20);
	this.sprite.update(Math.random()*this.sprite.totalDuration);
	this.sprite.setCentered(true);
};

Ptero.Enemy.prototype = {
	update: function(dt) {
		this.sprite.update(dt);
		this.updateScale(dt);
	},
	updateScale: function(dt) {
		this.scale += dt*0.25*this.scaleDir;
		if (this.scale > this.maxScale) {
			this.scale = this.maxScale;
			this.scaleDir *= -1;
		}
		else if (this.scale < this.minScale) {
			this.scale = this.minScale;
			this.scaleDir *= -1;
		}
	},
	draw: function(ctx) {
		this.sprite.draw(ctx,this.x,this.y,this.scale);
	},
};
