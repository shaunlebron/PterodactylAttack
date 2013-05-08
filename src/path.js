Ptero.Path = function(interp, loop) {
	this.interp = interp;
	this.startTime = interp.startTime;
	this.totalTime = interp.totalTime;
	this.loop = loop;
	this.reset();
};

Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function seek(dt) {

		// Turn the interpolated value into a vector object.
		// Also add the "angle" property to it.
		var i = this.interp(this.time+dt);
		if (i == null) {
			return null;
		}
		var v = (new Ptero.Vector).set(i);
		v.angle = i.angle;

		return v;
	},
	setTime: function(t) {
		this.time = 0;
		this.step(t);
	},

	step: function step(dt) {
		this.time += dt;
		if (this.loop) {
			this.time %= this.totalTime;
		}
		this.pos = this.seek(0);
	},

	reset: function reset() {
		this.time = 0;
		this.step(0);
	},

	isDone: function isDone() {
		return !this.loop && this.time > this.totalTime; 
	},

	isPresent: function() {
		return this.pos != null;
	},
};
