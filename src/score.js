
Ptero.score = (function(){

	function zeroPad(numDigits,number) {
		var result = (""+number);
		var len = result.length;
		var i;
		for (i=len; i<numDigits; i++) {
			result = "0" + result;
		}
		return result;
	}

	var highScore;

	var total = 0;

	var waves;
	var kills;
	var hits;
	var misses;
	var captures;
	var bounties;
	var failedBounties;

	return {
		printState: function() {
			console.log("SCORE::::::::::::");
			console.log(kills,'kills');
			console.log(hits,'hits');
			console.log(misses,'misses');
			console.log(this.getAccuracy(),'accuracy');
			console.log(bounties,'bounties');
			console.log(failedBounties,'failedBounties');
			console.log(":::::::::::::::::");
		},
		commitStats: function() {
			var highScore    = Ptero.settings.get("high_score");
			var highWaves    = Ptero.settings.get("high_waves");
			var highKills    = Ptero.settings.get("high_kills");
			var highCaptures = Ptero.settings.get("high_captures");
			var highBounties = Ptero.settings.get("high_bounties");

			var isNewHigh = {
				"score"    : total    > highScore,
				"waves"    : waves    > highWaves,
				"kills"    : kills    > highKills,
				"captures" : captures > highCaptures,
				"bounties" : bounties > highBounties,
			};

			Ptero.settings.set("high_score",    Math.max(total,    highScore));
			Ptero.settings.set("high_waves",    Math.max(waves,    highWaves));
			Ptero.settings.set("high_kills",    Math.max(kills,    highKills));
			Ptero.settings.set("high_captures", Math.max(captures, highCaptures));
			Ptero.settings.set("high_bounties", Math.max(bounties, highBounties));

			return isNewHigh;
		},
		addWaves: function(delta) {
			waves += delta;
		},
		addKills: function(delta) {
			kills += delta;
		},
		addHits: function(delta) {
			hits += delta;
		},
		addMisses: function(delta) {
			misses += delta;
		},
		addCaptures: function(delta) {
			captures += delta;
		},
		addBounties: function(delta) {
			bounties += delta;
		},
		addFailedBounties: function(delta) {
			failedBounties += delta;
		},
		getWaves: function() {
			return waves;
		},
		getKills: function() {
			return kills;
		},
		getHits: function() {
			return hits;
		},
		getMisses: function() {
			return misses;
		},
		getCaptures: function() {
			return captures;
		},
		getBounties: function() {
			return bounties;
		},
		getAccuracy: function() {
			var total = hits + misses;
			return (total == 0) ? 0 : hits/total;
		},
		reset: function() {
			total = 0;
			waves = 0;
			kills = 0;
			hits = 0;
			misses = 0;
			captures = 0;
			bounties = 0;
			failedBounties = 0;
		},
		update: function(dt) {
		},
		getScoreStr: function() {
			return zeroPad(7,total);
		},
		addPoints: function(value) {
			total += value;
		},
		setTotal: function(value) {
			total = value;
		},
		getTotal: function() {
			return total;
		},
	};
})();
