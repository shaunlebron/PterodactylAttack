
Ptero.input = (function(){

	var dragging = false;
	var touchStart = function(x,y) {
		dragging = true;
	};
	var touchDrag = function(x,y) {
		if (!dragging) {
			return;
		}
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
				p.x = evt.pageX - p.x;
				p.y = evt.pageY - p.y;
				f(p.x,p.y);
			};
		};
		canvas.addEventListener('mousedown',	wrapFunc(touchStart));
		canvas.addEventListener('mousemove',	wrapFunc(touchDrag));
		canvas.addEventListener('mouseup',		wrapFunc(touchEnd));
		canvas.addEventListener('mouseout',		wrapFunc(touchCancel));
		canvas.addEventListener('touchstart',	wrapFunc(touchStart));
		canvas.addEventListener('touchdrag',	wrapFunc(touchDrag));
		canvas.addEventListener('touchend',		wrapFunc(touchEnd));
		canvas.addEventListener('touchcancel',	wrapFunc(touchCancel));

	};

	return {
		init: init,
	};
})();
