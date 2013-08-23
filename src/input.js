
Ptero.input = (function(){

	// A touch handler is a dictionary of callback functions for each touch event.
	//
	// x = canvas coordinate x
	// y = canvas coordinate y
	// i = touch index (for identifying multiple touch points)
	//
	//		var touchHandler = {
	//			start: function(x,y,i) {
	//			},
	//			move: function(x,y,i) {
	//			},
	//			end: function(x,y,i) {
	//			},
	//			cancel: function(x,y,i) {
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
	function touchStart(x,y,i) {
		touched = true;
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.start && h.start(x,y,i);
		});
	};
	function touchMove(x,y,i) {
		if (!touched) {
			return;
		}
		point.x = x;
		point.y = y;
		forEachTouchHandler(function(h) {
			h.move && h.move(x,y,i);
		});
	};
	function touchEnd(x,y,i) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.end && h.end(x,y,i);
		});
	};
	function touchCancel(x,y,i) {
		touched = false;
		forEachTouchHandler(function(h) {
			h.cancel && h.cancel(x,y,i);
		});
	};
	function scroll(x,y,delta,deltaX,deltaY) {
		forEachTouchHandler(function(h) {
			h.scroll && h.scroll(x,y,delta,deltaX,deltaY);
		});
	};

	// initialize 
	function init() {

		// Makes sure the given callback function gets canvas coords, not absolute coords.
        var canvas = Ptero.screen.getCanvas();
		var wrapFunc = function(f) {
			return function(evt) {
				var canvasPos = Ptero.screen.getCanvasPos();
				function passCoordToEvent(x,y,index) {
					var windowPos = Ptero.screen.canvasToWindow(x-canvasPos.x, y-canvasPos.y);
					f(windowPos.x, windowPos.y, index);
				}
				var touches = evt.changedTouches;
				if (touches && touches.length > 0) {
					var i;
					for (i=0; i<touches.length; i++) {
						var t = touches[i];
						passCoordToEvent(t.pageX, t.pageY, t.identifier);
					}
				}
				else {
					passCoordToEvent(evt.pageX, evt.pageY, 0);
				}
				evt.preventDefault();
			};
		};
		var isJQueryLoaded;
		try {
			isJQueryLoaded = jQuery;
		}
		catch (e) {
			isJQueryLoaded = false;
		}
		if (isJQueryLoaded) {
			$('#canvas').mousewheel(function(evt,delta,deltaX,deltaY) {
				var x,y;
				if (evt.touches && evt.touches.length > 0) {
					x = evt.touches[0].pageX;
					y = evt.touches[0].pageY;
				}
				else {
					x = evt.pageX;
					y = evt.pageY;
				}
				var canvasPos = Ptero.screen.getCanvasPos();
				var windowPos = Ptero.screen.canvasToWindow(x-canvasPos.x, y-canvasPos.y);

				evt.preventDefault();
				scroll(windowPos.x, windowPos.y,delta,deltaX,deltaY);
			});
		}
		if (!navigator.isCocoonJS) {
			canvas.addEventListener('mousedown',	wrapFunc(touchStart));
			canvas.addEventListener('mousemove',	wrapFunc(touchMove));
			canvas.addEventListener('mouseup',		wrapFunc(touchEnd));
			canvas.addEventListener('mouseout',		wrapFunc(touchCancel));
		}
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
				/*
				if (Ptero.Ptalaga || Ptero.Baklava || Ptero.Fourier) {
				}
				else {
					toggleFullScreen(document.getElementsByTagName("html")[0]);
				}
				*/
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
