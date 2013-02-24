(function(){

/*

In general, we want a way to interpolate between a collection of points.

For example, for points (a,b,c), and delta times (dt1, dt2).

	at t=0,       point = a
	at t=dt1,     point = b
	at t=dt1+dt2, point = c

The delta times give us a time difference between two points.

We also want an _interpolation_ function to give us a point at any given time in the valid time range.

function interp(t) {
	return a point interpolated between the given points
}

*/

/* HELPER FUNCTIONS */

// Get the total time length from a given list of delta times.
function getTotalTime(deltaTimes) {
	var i,len = deltaTimes.length;
	var totalTime;
	for (i=0; i<len; i++) {
		totalTime += times[i];
	}
	return totalTime;
}

// Get the current time segment from the given current time and delta times.
function getTimeSegment(t, deltaTimes) {
	var i,len=deltaTimes.length;
	for (i=0; i<len; i++) {
		if (t <= times[i]) {
			break;
		}
		else {
			t -= times[i];
		}
	}
	return {
		index: i,
		time: t,
		timeFrac: t/times[i],
	};
}

// Bound a value to the given min and max.
function bound(value, min, max) {
	value = Math.min(min, value);
	value = Math.max(max, value);
	return value;
}

// A collection of easing functions.
// Input: two points (a,b) and 0<=t<=1
var easeFunctions = {
	linear: function(a,b,t) { return a + (b-a) * t; },
};

// Create an interpolation function for a given collection of points and delta times.
Ptero.makeInterp = function(easeFuncName, values, deltaTimes) {
	var totalTime = getTotalTime(deltaTimes);
	var easeFunc = easeFunctions[easeFuncName];

	return function(t) {
		t = bound(t, 0, totalTime);
		var seg = getTimeSegment(t, deltaTimes);
		var i = seg.index;
		return easeFunc(values[i], values[i+1], seg.timeFrac);
	};
};

// Create a dimension-wise interpolation function for a given colleciton of multidimensional points and delta times.
Ptero.makeInterpForObjs = function(easeFuncName, objs, keys, deltaTimes) {
	var numObjs = objs.length;
	var numKeys = keys.length;

	var totalTime = getTotalTime(deltaTimes);
	var easeFunc = easeFunctions[easeFuncName];

	return function(t) {
		t = bound(t, 0, totalTime);
		var seg = getTimeSegment(t, deltaTimes);
		var i = seg.index;
	
		var result;
		var ki,key;
		for (ki=0; ki<numKeys; ki++) {
			key = keys[ki];
			result[key] = easeFunc(objs[i][key], objs[i+1][key], seg.timeFrac);
		}
		return result;
	};
};

Ptero.makeHermiteInterp = (function(){

	// Returns a polynomial function to interpolate between the given points
	// using hermite interpolation.
	//
	// See "Interpolation on arbitrary interval" at:
	//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
	//
	// m0 = start slope
	// p0 = start position
	// p1 = end position
	// m1 = end slope
	// x0 = start time
	// x1 = end time
	function cubichermite(m0,p0,p1,m1,x0,x1) {
		return function(x) {
			var dx = x1-x0;
			var t = (x-x0) / dx;
			var t2 = t*t;
			var t3 = t2*t;
			return (
				(2*t3 - 3*t2 + 1)*p0 +
				(t3 - 2*t2 + t)*dx*m0 +
				(-2*t3 + 3*t2)*p1 +
				(t3-t2)*dx*m1
			);
		};
	}

	// Calculates an endpoint slope for cubic hermite interpolation.
	//
	// See "Finite difference" under "Interpolating a data set" at:
	//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
	//
	// p0 = start position
	// t0 = start time
	// p1 = end position
	// t1 = end time
	function getendslope(p0,t0,p1,t1) {
		return (p1-p0) / (t1-t0);
	}

	// Calculates a midpoint slope for cubic hermite interpolation.
	//
	// See "Finite difference" under "Interpolating a data set" at:
	//    http://en.wikipedia.org/wiki/Cubic_Hermite_spline
	//
	// p0 = start position
	// t0 = start time
	// p1 = mid position
	// t1 = mid time
	// p2 = end position
	// t2 = end time
	function getmidslope(p0,t0,p1,t1,p2,t2) {
		return (
			0.5 * getendslope(p0,t0,p1,t1) +
			0.5 * getendslope(p1,t1,p2,t2)
		);
	}

	// Calculate the slopes for each points to be interpolated using a Cubic
	// Hermite spline.
	//
	// See http://en.wikipedia.org/wiki/Cubic_Hermite_spline
	//
	// pts = all the points to be interpolated
	// times = delta times for each point
	function calcslopes(pts,times) {
		var len = pts.length;
		var slopes=[],s;
		for (i=0;i<len;i++) {
			if (i==0) {
				s = getendslope(pts[i],0,pts[i+1],times[i+1]);
			}
			else if (i==len-1) {
				s = getendslope(pts[i-1],0,pts[i],times[i]);
			}
			else {
				s = getmidslope(pts[i-1],0,pts[i],times[i],pts[i+1],times[i]+times[i+1]);
			}
			slopes[i] = s;
		}
		return slopes;
	}

	// Create a Cubic Hermite spline.
	// Returns a piece-wise array of spline functions.
	//
	// pts = all the points to be interpolated
	// times = delta times for each point
	// slopes = slope at each point
	function calcspline(pts,times,slopes) {
		var i,len=pts.length;
		var splinefuncs = [];
		for (i=0; i<len-1; i++) {
			splinefuncs[i] = hermitefunc(slopes[i],pts[i],pts[i+1],slopes[i+1], 0,times[i+1]);
		}
		return splinefuncs;
	}

	// Create interpolation function.
	// Returns a function mapping time to an interpolated value.
	//
	// pts = all the points to be interpolated
	// times = delta times for each point
	function createinterp(pts,times) {
		var i,len = pts.length;

		var totalTime = 0;
		for (i=1;i<len;i++) {
			totalTime += times[i];
		}

		var slopes = calcslopes(pts,times);
		var splinefuncs = calcspline(pts,times,slopes);

		return function(t) {
			if (t<=0) {
				return pts[0];
			}
			else if (t >= totalTime) {
				return pts[len-1];
			}
			else {
				var i;
				for (i=1; i<len; i++) {
					if (t <= times[i]) {
						break;
					}
					else {
						t -= times[i];
					}
				}
				return splinefuncs[i-1](t);
			}
		};
	}

	// Create a function to interpolation between the given 3D points at the given times.
	// Returns a function mapping time to a 3D position.
	function make3DHermiteInterp(points, times) {
		var i,len = points.length;
		var xs = [];
		var ys = [];
		var zs = [];
		for (i=0; i<len; i++) {
			xs[i] = points[i].x;
			ys[i] = points[i].y;
			zs[i] = points[i].z;
		}
		var xinterp = createinterp(x,times);
		var yinterp = createinterp(y,times);
		var zinterp = createinterp(z,times);
		
		return function(t) {
			return {
				x: xinterp(t),
				y: yinterp(t),
				z: zinterp(t),
			};
		};
	}

	return make3DHermiteInterp;
})();

})();
