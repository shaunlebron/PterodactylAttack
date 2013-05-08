
Ptero.Fourier.LivePane = function() {
	this.scene = Ptero.Fourier.scene_fourier;
};

Ptero.Fourier.LivePane.prototype = {

	draw: function(ctx) {
		this.scene.draw(ctx);

		/*
		var p = Ptero.painter;
		var f = Ptero.screen.getFrustum();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		p.moveTo(ctx, { x: f.nearLeft, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearLeftA, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearLeftA, y: f.nearBottom, z: f.near });
		p.lineTo(ctx, { x: f.nearLeft, y: f.nearBottom, z: f.near });
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		p.moveTo(ctx, { x: f.nearRight, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearRightA, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearRightA, y: f.nearBottom, z: f.near });
		p.lineTo(ctx, { x: f.nearRight, y: f.nearBottom, z: f.near });
		ctx.closePath();
		ctx.fill();
		*/
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},
};
