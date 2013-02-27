
Ptero.Crater.LivePane = function() {
	this.scene = Ptero.Crater.scene_crater;
};

Ptero.Crater.LivePane.prototype = {
	screenToSpace: function(x,y) {
		var z = Ptero.Crater.enemy.path.pos.z;
		var frustum = Ptero.screen.getFrustum();
		var spacePos = Ptero.screen.screenToSpace({x:x,y:y});
		spacePos = frustum.projectToZ(spacePos, z);
		return {
			x: spacePos.x,
			y: spacePos.y,
		};
	},

	/* INPUT FUNCTIONS */

	mouseStart: function(x,y) {
		this.updateEnemyPosition(x,y);
	},
	mouseMove: function(x,y) {
		this.updateEnemyPosition(x,y);
	},
	mouseEnd: function(x,y) {
		this.updateEnemyPosition(x,y);
	},

	updateEnemyPosition: function(x,y) {
		var pos = this.screenToSpace(x,y);
		var point = Ptero.Crater.enemy_points[0];
		point.x = pos.x;
		point.y = pos.y;
		point.z = Math.max(0.0001, point.z);
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
