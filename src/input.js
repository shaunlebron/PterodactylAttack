
Ptero.input = (function(){

	// A touch handler is a dictionary of callback functions for each touch event.
	//		var touchHandler = {
	//			start: function(x,y) {
	//			},
	//			move: function(x,y) {
	//			},
	//			end: function(x,y) {
	//			},
	//			cancel: function(x,y) {
	//			},
	//		};
	var touchHandlers = [];
	var addTouchHandler = function(h) {
		touchHandlers.push(h);
	};
	var removeTouchHandler = function(h) {
		var i;
		while ( (i=touchHandlers.indexOf(h)) != -1) {
			touchHandlers.splice(i,1);
		}
	};
	var forEachTouchHandler = function(callback) {
		var len = touchHandlers.length;
		var i;
		for (i=0; i<len; i++) {
			callback(touchHandlers[i],i);
		};
	};

	var touched = false; // is screen currently being touched.
	var point = {}; // current touch point.

	// Main dispatch functions for each touch event.
	var touchStart = function(x,y) {
		touched = true;
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.start && h.start(x,y);
		});
	};
	var touchMove = function(x,y) {
		if (!touched) {
			return;
		}
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.move && h.move(x,y);
		});
	};
	var touchEnd = function(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.end && h.end(x,y);
		});
	};
	var touchCancel = function(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.cancel && h.cancel(x,y);
		});
	};

	// initialize 
	var init = function() {

		// Makes sure the given callback function gets canvas coords, not absolute coords.
        var canvas = Ptero.screen.getCanvas();
		var wrapFunc = function(f) {
			return function(evt) {
				var canvasPos = Ptero.screen.getCanvasPos();
				var p = {x:canvasPos.x, y:canvasPos.y};
				var x,y;
				if (evt.touches && evt.touches.length > 0) {
					x = evt.touches[0].pageX;
					y = evt.touches[0].pageY;
				}
				else {
					x = evt.pageX;
					y = evt.pageY;
				}
				p.x = x - p.x;
				p.y = y - p.y;
				f(p.x,p.y);
			};
		};
		canvas.addEventListener('mousedown',	wrapFunc(touchStart));
		canvas.addEventListener('mousemove',	wrapFunc(touchMove));
		canvas.addEventListener('mouseup',		wrapFunc(touchEnd));
		canvas.addEventListener('mouseout',		wrapFunc(touchCancel));
		canvas.addEventListener('touchstart',	wrapFunc(touchStart));
		canvas.addEventListener('touchmove',	wrapFunc(touchMove));
		canvas.addEventListener('touchend',		wrapFunc(touchEnd));
		canvas.addEventListener('touchcancel',	wrapFunc(touchCancel));
	};

	return {
		init: init,
		isTouched: function() { return touched; },
		getPoint: function() { return point; },
		addTouchHandler: addTouchHandler,
		removeTouchHandler: removeTouchHandler,
	};
})();
