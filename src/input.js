
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
	function addTouchHandler(h) {
		touchHandlers.push(h);
	};
	function removeTouchHandler(h) {
		var i;
		while ( (i=touchHandlers.indexOf(h)) != -1) {
			touchHandlers.splice(i,1);
		}
	};
	function forEachTouchHandler(callback) {
		var len = touchHandlers.length;
		var i;
		for (i=0; i<len; i++) {
			if (touchHandlers[i]) {
				callback(touchHandlers[i],i);
			}
		};
	};

	var touched = false; // is screen currently being touched.
	var point = {}; // current touch point.

	// Main dispatch functions for each touch event.
	function touchStart(x,y) {
		touched = true;
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.start && h.start(x,y);
		});
	};
	function touchMove(x,y) {
		if (!touched) {
			return;
		}
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.move && h.move(x,y);
		});
	};
	function touchEnd(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.end && h.end(x,y);
		});
	};
	function touchCancel(x,y) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.cancel && h.cancel(x,y);
		});
	};

	// initialize 
	function init() {

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
					evt.preventDefault();
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

		// from: https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
		function toggleFullScreen(elm) {
			if (!document.fullscreenElement &&    // alternative standard method
					!document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
				if (elm.requestFullscreen) {
					elm.requestFullscreen();
				} else if (elm.mozRequestFullScreen) {
					elm.mozRequestFullScreen();
				} else if (elm.webkitRequestFullscreen) {
					elm.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			} else {
				if (document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
			}
		}
		document.addEventListener('keydown', function(e) {
			if (e.keyCode == 13) { // enter key
				toggleFullScreen(document.getElementsByTagName("html")[0]);
			}
			else if (e.keyCode == 70) { // f
				Ptero.executive.toggleFps();
			}
			else if (e.keyCode == 66) { // b
				Ptero.painter.toggleDebugOutline();
			}
		},false);
	};

	return {
		init: init,
		isTouched: function() { return touched; },
		getPoint: function() { return point; },
		addTouchHandler: addTouchHandler,
		removeTouchHandler: removeTouchHandler,
	};
})();
