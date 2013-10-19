Ptero.Player = function() {
	this.maxHealth = 8;
	this.initHealth = 4;

	this.reset();
	this.setGod(false);
};

Ptero.Player.prototype = {
	toggleGod: function() {
		this.setGod(!this.isGod);
	},
	setGod: function(on) {
		if (!navigator.isCocoonJS) {
			var elm = document.getElementById('god-state');
			if (elm) {
				elm.innerHTML = on ? "ON" : "OFF";
			}
		}
		this.isGod = on;
	},
	reset: function() {
		this.health = this.initHealth;
	},
	earnHealth: function(hp) {
		this.health = Math.min(this.maxHealth, this.health+hp);
	},
	applyDamage: function(dmg) {
		if (this.isGod) {
			dmg = 0;
		}

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
};
