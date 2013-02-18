
Ptero.Crater.LivePane = function() {
	this.scene = Ptero.Crater.scene_crater;
};

Ptero.Crater.LivePane.prototype = {
	screenToSpace: function(x,y) {
		var z = Ptero.Crater.enemy.path.state.pos.z;
		var frustum = Ptero.screen.getFrustum();
		var spacePos = Ptero.screen.screenToSpace(x,y);
		spacePos = frustum.projToZ(spacePos, z);
		return {
			x: spacePos.x,
			y: spacePos.y,
		};
	},

	draw: function(ctx) {
		this.scene.draw(ctx);
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},
};
