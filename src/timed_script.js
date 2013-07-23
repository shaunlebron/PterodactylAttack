Ptero.TimedScript = function(events) {
	this.events = events;
	this.init();
}

Ptero.TimedScript.prototype = {
	init: function() {
		this.currentEvent = 0;
		this.time = 0;
	},

	update: function(dt) {
		this.time += dt;
		var e = this.events[this.currentEvent];
		while (e && this.time >= e.time) {
			e.action();
			e = this.events[++this.currentEvent];
		}
	},
};
