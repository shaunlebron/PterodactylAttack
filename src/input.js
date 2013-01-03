
Ptero.input = (function(){

	var dragging = false;
	var point = {};
	var touchStart = function(x,y) {
		dragging = true;
		point.x = x;
		point.y = y;
	};
	var touchDrag = function(x,y) {
		if (!dragging) {
			return;
		}
		point.x = x;
		point.y = y;
	};
	var touchEnd = function(x,y) {
		dragging = false;
	};
	var touchCancel = function(x,y) {
		dragging = false;
	};

	var init = function() {
		var canvas = Ptero.screen.getCanvas();
		var canvasPos = Ptero.screen.getCanvasPos();

		var wrapFunc = function(f) {
			return function(evt) {
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
		canvas.addEventListener('mousemove',	wrapFunc(touchDrag));
		canvas.addEventListener('mouseup',		wrapFunc(touchEnd));
		canvas.addEventListener('mouseout',		wrapFunc(touchCancel));
		canvas.addEventListener('touchstart',	wrapFunc(touchStart));
		canvas.addEventListener('touchmove',	wrapFunc(touchDrag));
		canvas.addEventListener('touchend',		wrapFunc(touchEnd));
		canvas.addEventListener('touchcancel',	wrapFunc(touchCancel));

	};

	return {
		init: init,
		isDragging: function() { return dragging; },
		getPoint: function() { return point; },
	};
})();
