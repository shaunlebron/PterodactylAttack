
Ptero.StopWatch = function() {
	this.reset();
};

Ptero.StopWatch.prototype = {
	reset: function reset() {
		this.elapsedMillis = 0;
	},
	increment: function increment(millis) {
		this.elapsedMillis += millis;
	},
};

Ptero.Timer = function(millisLimit) {
	this.millisLimit = millisLimit;
	this.stopWatch = new Ptero.StopWatch;
};

Ptero.Timer.prototype = {
	setFinishCallback: function setFinishCallback(callback) {
		this.onFinish = callback;
	},
	isDone: function isDone() {
		return this.stopWatch.elapsedMillis > this.millisLimit;
	},
	getElapsedMillis: function getElapsedMillis() {
		return this.stopWatch.elapsedMillis;
	},
	reset: function reset() {
		this.stopWatch.reset();
	},
	increment: function increment(millis) {
		if (this.isDone()) {
			this.onFinish && this.onFinish();
		}
		else {
			this.stopWatch.increment(millis);
		}
	},
};
