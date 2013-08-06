
Ptero.refreshBounty = function() {
	Ptero.bounty = new Ptero.Bounty();
};

Ptero.Bounty = function() {
	// number of items in the bounty
	this.size = 5;

	// number of different colors
	this.makeColorTable();

	// populate items (i.e. random colors) in the bounty
	var numColors = this.numColors;
	function getRandomColor() {
		return Math.floor(Math.random()*numColors);
	};
	this.items = [];
	this.caught = [];
	var i;
	for (i=0; i<this.size; i++) {
		this.items.push(getRandomColor());
		this.caught.push(false);
	};

};

Ptero.Bounty.prototype = {
	makeColorTable: function() {
		// associate color indexes to this stage's particular colors and enemies
		var stage = Ptero.scene_play.getStage();
		if (stage == "mountain") {
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
	update: function(dt) {
	},
	draw: function(ctx) {
	},
};
