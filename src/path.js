Ptero.PathState = function(index,indexStep,time,pos) {
	if (index == null) index = 0;
	if (indexStep == null) indexStep = 1;
	if (time == null) time = 0;
	if (pos == null) pos = new Ptero.Vector;
	this.index = index;
	this.indexStep = indexStep;
	this.time = time;
	this.pos = pos;
};

Ptero.Path = function(points, times, loop) {
	this.points = points;
	this.times = times;
	this.loop = loop;
	this.state = new Ptero.PathState;
	this.reset();
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function seek(dt) {

		var i = this.state.index;
		var iStep = this.state.indexStep;
		var t = this.state.time+dt;
		var p = new Ptero.Vector;

		while (true) {

			if (this.loop) {
				// change direction if at ends
				if (i == this.points.length-1) {
					if (iStep == 1) {
						iStep = -1;
					}
				}
				else if (i == 0) {
					if (iStep == -1) {
						iStep = 1;
					}
				}
			}
			else {
				// stop if at end
				if (i == this.points.length-1) {
					break;
				}
			}

			if (t >= this.times[i+iStep]) {
				t -= this.times[i+iStep];
				i += iStep;
				continue;
			}
			else {
				break;
			}
		}

		if (!this.loop && i == this.points.length-1) {
			// end of path
			p.set(this.points[i]);
		}
		else {
			// between two control points
			p.set(this.points[i+iStep]).sub(this.points[i]).mul(t/this.times[i+iStep]).add(this.points[i]);
		}

		return new Ptero.PathState(i,iStep,t,p);
	},

	step: function step(dt) {
		this.state = this.seek(dt);
	},

	reset: function reset() {
		this.state.index = 0;
		this.state.indexStep = 1;
		this.state.time = 0;
		this.state.pos.set(this.points[0]);
	},

	isDone: function isDone() {
		return !this.loop && this.state.index == this.points.length-1;
	},
};
