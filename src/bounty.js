
Ptero.bountySize = 5;
Ptero.refreshBounty = function() {
	Ptero.bounty = new Ptero.Bounty(Ptero.bountySize);
};

Ptero.Bounty = function(size) {

	// number of different colors
	this.makeColorTable();

	// populate items (i.e. random colors) in the bounty
	var numColors = this.numColors;
	this.setRandomItems(size);

	this.autoReset = true;
};

Ptero.Bounty.prototype = {
	setRandomItems: function(numItems) {
		var items = [];
		var numColors = this.numColors;
		function getRandomColor() {
			return Math.floor(Math.random()*numColors);
		};
		var i;
		for (i=0; i<numItems; i++) {
			items.push(getRandomColor());
		}
		this.setItems(items);
		this.random = true;
	},
	setItems: function(items) {
		this.items = [];
		this.caught = [];
		this.cagedEnemies = [];
		var i,len=items.length;
		this.size = len;
		for (i=0; i<len; i++) {
			this.items.push(items[i]);
			this.caught.push(false);
		}
		this.random = false;
	},
	makeColorTable: function() {
		// associate color indexes to this stage's particular colors and enemies
		var stage = Ptero.background.name;
		if (stage == "mountain" || stage == 'tutorial') {
			this.colors = [
				'#7EBBED',
				'#BF56F6',
				'#B12432',
				'#24B151',
			];
			this.enemyNames = [
				"baby_mountain_blue",
				"baby_mountain_purple",
				"adult_mountain_red",
				"adult_mountain_green",
			];
		}
		else if (stage == "ice") {
			this.colors = [
				'#BF6EFD',
				'#E8C358',
				'#D13169',
				'#2FB582',
			];
			this.enemyNames = [
				"baby_ice_purple",
				"baby_ice_yellow",
				"adult_ice_red",
				"adult_ice_green",
			];
		}
		else if (stage == "volcano") {
			this.colors = [
				'#60DD84',
				'#9887DB',
				'#1AA4BB',
				'#DC6A0B',
			];
			this.enemyNames = [
				"baby_volcano_green",
				"baby_volcano_purple",
				"adult_volcano_blue",
				"adult_volcano_orange",
			];
		}
		else {
			this.colors = [];
			this.enemyNames = [];
		}
		this.numColors = this.colors.length;
	},
	isEnemyDesired: function(e) {
		var colorIndex = this.getColorIndexFromEnemy(e);
		var itemIndex = this.getDesiredItemIndexFromColor(colorIndex);
		return itemIndex != null;
	},
	getColorIndexFromEnemy: function(e) {
		var i;
		for (i=0; i<this.numColors; i++) {
			if (e.typeName == this.enemyNames[i]) {
				return i;
			}
		}
		return null;
	},
	getDesiredItemIndexFromColor: function(c) {
		var i,len=this.size;
		for (i=0; i<len; i++) {
			if (this.items[i] == c && !this.caught[i]) {
				return i;
			}
		}
		return null;
	},
	isComplete: function() {
		for (i=0; i<this.size; i++) {
			if (!this.caught[i]) {
				return false;
			}
		}
		return true;
	},
	addEnemy: function(e) {
		if (this.isBlackHole) {
			e.die();
			return;
		}

		// get the color index of the given enemy
		var colorIndex = this.getColorIndexFromEnemy(e);

		// determine if and where the enemy fits in the remaining items in the bounty
		var itemIndex = this.getDesiredItemIndexFromColor(colorIndex);

		// add this enemy to the cage
		this.cagedEnemies.push(e);

		if (itemIndex != null) {
			// caught enemy fits the remaining bounty

			// flag the caught enemy
			this.caught[itemIndex] = true;

			if (this.isComplete()) {
				// signal bounty completion with sound
				Ptero.audio.play('bountyComplete');
				Ptero.score.addBounties(1);

				// earn bounty reward
				Ptero.player.earnHealth(1);

				// kill all pteros
				var len = this.cagedEnemies.length;
				for (i=0; i<len; i++) {
					this.cagedEnemies[i].die();
				}

				// create new bounty
				if (this.autoReset) {
					if (this.random) {
						Ptero.refreshBounty();
					}
					else {
						this.setItems(this.items);
					}
				}
			}
			else {

				// signal bounty progression with sound
				Ptero.audio.play('bountyCorrect');
				Ptero.score.addCaptures(1);

			}
		}
		else {
			// caught the wrong the ptero

			// signal bad bounty with sound
			Ptero.audio.play('bountyWrong');
			Ptero.score.addFailedBounties(1);

			e.onMiscatch && e.onMiscatch();

			// release all caged enemies
			var len = this.cagedEnemies.length;
			for (i=0; i<len; i++) {
				this.cagedEnemies[i].release();
			}

			// create new bounty
			// create new bounty
			if (this.random) {
				Ptero.refreshBounty();
			}
			else {
				this.setItems(this.items);
			}
		}
		
		
	},
	update: function(dt) {
	},
	draw: function(ctx) {
	},
};
