Ptero.Player = function() {
	this.maxHealth = 5;
	this.initHealth = 3;
	this.damage = 1;

	this.reset();
};

Ptero.Player.prototype = {
	reset: function() {
		this.health = this.initHealth;
	},
	applyDamage: function(dmg) {
		if (this.health > 0) {
			if (Ptero.scene_options.isVibrate()) {
				navigator.vibrate && navigator.vibrate(200);
			}
			Ptero.screen.shake();
			this.health -= dmg;
			if (this.health <= 0) {
				this.die();
			}
		}
	},
	die: function() {
	},
	drawHealth: function(ctx) {
		var pad = Ptero.hud.getBorderPad();
		var y = 3*pad;
		var x = Ptero.screen.getWidth() - pad;

		var spriteTable = Ptero.assets.tables["health"];
		var scale = Ptero.background.getScale() * spriteTable.scale;
		var w = spriteTable.tileWidth * scale;
		var h = spriteTable.tileHeight * scale;

		var i,len=this.maxHealth;
		for (i=0; i<len; i++) {
			var pos = Ptero.screen.screenToSpace({ x: x-w/2, y: y+h/2 });
			if (i <= this.health-1) {
				spriteTable.draw(ctx, pos, 0);
			}
			else {
				spriteTable.draw(ctx, pos, 1);
			}
			x -= w;
		}
	},
};
