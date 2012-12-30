Ptero.PathState = function(index,indexStep,time,pos) {
	if (index == undefined) index = 0;
	if (indexStep == undefined) indexStep = 1;
	if (time == undefined) time = 0;
	if (pos == undefined) pos = {};
	this.index = index;
	this.indexStep = indexStep;
	this.time = time;
	this.pos = pos;
};

Ptero.Path = function(points, times, loop) {
	this.points = points;
	this.times = times;
	this.state = new PathState;
	this.loop = loop;
};


Ptero.Path.prototype = {

	// return a predicted state that is dt seconds in the future
	seek: function(dt) {

		var i = this.index;
		var iStep = state.indexStep;
		var t = state.time+dt;
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
			p.set(points[i]);
		}
		else {
			// between two control points
			p.set(points[i+iStep]).sub(points[i]).mul(t/times[i+iStep]).add(points[i]);
		}

		return new PathState(i,iStep,t,p);
	},

	step: function(dt) {
		this.state = this.seek(dt);
	},

	reset: function() {
		this.state.index = 0;
		this.state.indexStep = 1;
		this.state.time = 0;
		this.state.pos.set(points[0]);
	},

	isDone: function() {
		return !this.loop && this.state.index == this.points.length-1;
	},
};
