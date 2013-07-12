
Ptero.scene_bgpos = (function(){

	var extremeIndex = null;
	var layerIndex = 0;
	var bg;

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {
		Ptero.input.addTouchHandler(touchHandler);
		bg = Ptero.bg_mountain;
		window.addEventListener('keyup', function(e) {
			if (e.keyCode == 49) { // 1
				extremeIndex = null;
			}
			else if (e.keyCode == 50) { // 2
				extremeIndex = null;
			}
			else if (e.keyCode == 51) { // 3
				console.log(JSON.stringify(bg.layerExtremes, null, '\t'));
			}
		});
		window.addEventListener('keydown', function(e) {
			if (e.keyCode == 49) { // 1
				extremeIndex = 0;
				setToExtremes();
			}
			else if (e.keyCode == 50) { // 2
				extremeIndex = 1;
				setToExtremes();
			}
			else {
				if (e.keyCode == 38) { // up
					layerIndex++;
				}
				else if (e.keyCode == 40) { // down
					layerIndex--;
				}
				else {
					return;
				}

				var length = bg.layerImages.length;
				if (layerIndex < 0) {
					layerIndex += length;
				}
				layerIndex %= length;
				console.log('layer', layerIndex);
			}
		});
	}

	function setPosition(x) {
		var i,len = bg.layerImages.length;
		var x0,x1;
		for (i=0; i<len; i++) {
			x0 = bg.layerExtremes[i][0];
			x1 = bg.layerExtremes[i][1];
			bg.layerPositions[i].x = x0 + (x1-x0) * (x/Ptero.screen.getWidth());
		}
	}

	function setToExtremes() {
		var i,len = bg.layerImages.length;
		for (i=0; i<len; i++) {
			bg.layerPositions[i].x = bg.layerExtremes[i][extremeIndex];
		}
	}

	var startPos;
	var startLayerX;
	var mode;
	var touchHandler = {
		start: function(x,y) {
			if (extremeIndex == null) {
				mode = 'position';
				setPosition(x);
			}
			else {
				mode = 'extreme';
				startPos = Ptero.screen.screenToSpace({x:x, y:y});
				startLayerX = bg.layerExtremes[layerIndex][extremeIndex];
			}
		},
		move: function(x,y) {
			if (mode == 'position') {
				setPosition(x);
			}
			else if (mode == 'extreme') {
				var dx = Ptero.screen.screenToSpace({x:x,y:y}).x - startPos.x;
				bg.layerExtremes[layerIndex][extremeIndex] = startLayerX + dx;
				console.log(bg.layerExtremes[layerIndex][extremeIndex]);
				setToExtremes();
			}
		},
		end: function(x,y) {
		},
		cancel: function(x,y) {
		},
	};

	function update(dt) {
	}

	function draw(ctx) {
		Ptero.bg_mountain.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
