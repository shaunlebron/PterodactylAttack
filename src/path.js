Ptero.Path = function(interp, loop) {
	this.interp = interp;
	this.totalTime = interp.totalTime;
	this.loop = loop;
	this.reset();
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function seek(dt) {
		return (new Ptero.Vector).set(this.interp(this.time+dt));
	},

	step: function step(dt) {
		this.time += dt;
		this.pos = this.seek(0);
	},

	reset: function reset() {
		this.time = 0;
		this.step(0);
	},

	isDone: function isDone() {
		return this.time >= this.totalTime; 
	},
};
