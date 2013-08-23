Ptero.Player = function() {
	this.maxHealth = 5;
	this.initHealth = 3;

	this.reset();

};

Ptero.Player.prototype = {
	reset: function() {
		this.health = this.initHealth;
	},
	earnHealth: function(hp) {
		this.health = Math.min(this.maxHealth, this.health+hp);
	},
	applyDamage: function(dmg) {
		if (this.health > 0) {
			if (Ptero.settings.isVibrateEnabled()) {
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
	drawHealth: function(ctx,shouldDrawBounty) {
		var pad = Ptero.hud.getBorderPad();
		var y = pad;
		var x = pad;

		var w = 50 * this.maxHealth;
		var h = 50;

		// create backdrop for both health and bounty
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillRect(0,0,w+pad*2,h*2+pad*3);
		
		// draw health border
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 2;
		ctx.strokeRect(x,y,w,h);
		ctx.fillStyle = "#FFF";
		ctx.fillRect(x,y,w / this.maxHealth * this.health, h);

		// draw bounty
		if (shouldDrawBounty) {
			var bounty = Ptero.bounty;
			(function(){
				var i;
				var r_small = h/4;
				var r_big = h/2;
				var space = 3 + r_big*2;
				var bx = x+r_big;
				var by = y + h + pad + h/2;
				for (i=0; i<bounty.size; i++) {
					var j = bounty.items[i];
					var r = bounty.caught[i] ? r_small : r_big;

					// draw circle
					ctx.beginPath();
					ctx.arc(bx,by,r,0,Math.PI*2);
					ctx.fillStyle = bounty.colors[j];
					ctx.fill();

					// darken circle if caught
					if (bounty.caught[i]) {
						ctx.fillStyle = "rgba(0,0,0,0.7)";
						ctx.fill();
					}
					bx += space;
				}
			})();
		}
	},
};
