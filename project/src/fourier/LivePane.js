
Ptero.Fourier.LivePane = function() {
	this.scene = Ptero.Fourier.scene_fourier;
};

Ptero.Fourier.LivePane.prototype = {

	draw: function(ctx) {
		ctx.save();
		Ptero.screen.transformToWindow();
		
		this.scene.draw(ctx);

		var p = Ptero.painter;
		var f = Ptero.frustum;
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

		ctx.restore();
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},

	mouseStart: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
	},

	mouseMove: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
	},

	mouseEnd: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
	},
};
