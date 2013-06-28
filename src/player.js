Ptero.Player = function() {
	this.health = 100;
	this.damage = 100;
};

Ptero.Player.prototype = {
	reset: function() {
		this.health = 100;
	},
	applyDamage: function(dmg) {
		if (this.health <= 0) {
			return;
		}

		console.log(this.health);
		//navigator.vibrate && navigator.vibrate(200);
		this.health -= dmg;
		if (this.health <= 0) {
			this.die();
		}
	},
	die: function() {
	},
};
