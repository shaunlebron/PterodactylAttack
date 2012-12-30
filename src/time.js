
Ptero.StopWatch = function() {
	this.reset();
};

Ptero.StopWatch.prototype = {
	reset: function() {
		this.elapsedMillis = 0;
	},
	increment: function(millis) {
		this.elapsedMillis += millis;
	},
};

Ptero.Timer = function(millisLimit) {
	this.millisLimit = millisLimit;
	this.stopWatch = new Ptero.StopWatch;
};

Ptero.Timer.prototype = {
	setFinishCallback: function(callback) {
		this.onFinish = callback;
	},
	isDone: function() {
		return this.stopWatch.elapsedMillis > this.millisLimit;
	},
	getElapsedMillis: function() {
		return this.stopWatch.elapsedMillis;
	},
	reset: function() {
		this.stopWatch.reset();
	},
	increment: function(millis) {
		if (this.isDone()) {
			this.onFinish && this.onFinish();
		}
		else {
			this.stopWatch.increment(millis);
		}
	},
};
