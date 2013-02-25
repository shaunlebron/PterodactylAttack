(function(){
	/*

	In general, we want a way to interpolate between a collection of points.
	Each point should have a "delta time", the time it takes to get to this
	point from the last.

	For example, for points (a,b,c), and delta times (t1, t2).

		at t=0,     point = a
		at t=t1,    point = b
		at t=t1+t2, point = c

	We also want an _interpolation_ function to give us a point at any given
	time in the valid time range.

	function interp(t) {
		return a point interpolated between the given points
	}

	*/

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
	//
	// Input:
	//   easeFuncName = name of function (from `easeFunctions`) to use to interpolate between two points
	//   values = values to be interpolated
	//   deltaTimes = times between each value
	//
	// Output:
	//   function(t) -> interpolated value
	//
	// Example:
	//
	//   (Create linear interpolation from 0 to 10 in 2.5s)
	//   var interp = makeInterp('linear', [0,10], [2.5]);  
	//
	//   (Get interpolated value at 0.75s)
	//   var val = interp(0.75);
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

	// Create a dimension-wise interpolation function for a given colleciton of
	// multidimensional points and delta times.
	//
	// Input:
	//   easeFuncName = name of function (from `easeFunctions`) to use to interpolate between two points
	//   objs = objects to be interpolated
	//   keys = keys to interpolate for each object
	//   deltaTimes = times between each value
	//
	// Output:
	//   function(t) -> interpolated object
	//
	// Example:
	//
	//   (Create linear interpolation for {x:0,y:0} to {x:20,y:35} in 2.5s)
	//   var interp = makeInterp('linear', [{x:0,y:0}, {x:20, y:35}], [2.5]);
	//
	//   (Get interpolated object at 0.75s)
	//   var obj = interp(0.75);
	Ptero.makeInterpForObjs = function(easeFuncName, objs, keys, deltaTimes) {
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

	// Begin scope for cubic hermite interpolation.
	(function(){

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
		// points = all the points to be interpolated
		// deltaTimes = delta times for each point
		function calcslopes(points,deltaTimes) {
			var len = pts.length;
			var slopes=[],s;
			for (i=0;i<len;i++) {
				if (i==0) {
					s = getendslope(
							points[i],   0,
							points[i+1], deltaTimes[i]);
				}
				else if (i==len-1) {
					s = getendslope(
							points[i-1], 0,
							points[i],   deltaTimes[i-1]);
				}
				else {
					s = getmidslope(
							points[i-1], 0,
							points[i],   deltaTimes[i-1],
							points[i+1], deltaTimes[i-1]+deltaTimes[i]);
				}
				slopes[i] = s;
			}
			return slopes;
		}

		// Create a Cubic Hermite spline.
		// Returns a piece-wise array of spline functions.
		//
		// points = all the points to be interpolated
		// deltaTimes = delta times for each point
		// slopes = slope at each point
		//
		function calcspline(points,deltaTimes,slopes) {
			var i,len=points.length;
			var splinefuncs = [];
			for (i=0; i<len-1; i++) {
				splinefuncs[i] = cubichermite(
					slopes[i],points[i],
					points[i+1],slopes[i+1],
					0,deltaTimes[i+1]);
			}
			return splinefuncs;
		}

		// Create interpolation function.
		// Returns a function mapping time to an interpolated value.
		//
		// points = all the points to be interpolated
		// deltaTimes = delta times for each point
		Ptero.Crater.makeHermiteInterp = function(values,deltaTimes) {
			var totalTime = getTotalTime(deltaTimes);

			var slopes = calcslopes(points,deltaTimes);
			var splinefuncs = calcspline(points,deltaTimes,slopes);

			return function(t) {
				var seg = getTimeSegment(t, times);
				return splinefuncs[seg.index](seg.time);
			};
		}

		Ptero.Crater.makeHermiteInterpForObjs = function(objs,keys,deltaTimes) {
			var numKeys = keys.length;
			var numObjs = objs.length;

			var totalTime = getTotalTime(deltaTimes);

			var values={},slopes={}, splinefuncs={};
			var i,ki,key;
			for (ki=0; ki<numKeys; ki++) {
				key = keys[ki];
				values[key] = [];
				for (i=0; i<numObjs; i++) {
					values[key][i] = objs[i][key];
				}
				slopes[key] = calcslopes(values[key], deltaTimes);
				splinefuncs[key] = calcspline(values[key],deltaTimes,slopes[key]);
			}

			return function(t) {
				var seg = getTimeSegment(t, times);

				var result;
				var ki,key;
				for (ki=0; ki<numKeys; ki++) {
					key = keys[ki];
					result[key] = splinefuncs[key][seg.index](seg.time);
				}
				return result;
			};
		}

	})(); // Close scope for cubic hermite interpolation.

})();
