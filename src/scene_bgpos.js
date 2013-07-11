
Ptero.scene_bgpos = (function(){

	var index = 0;
	var bg;

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	function init() {
		Ptero.input.addTouchHandler(touchHandler);
		bg = Ptero.bg_mountain;
		window.addEventListener('keydown', function(e) {
			if (e.keyCode == 38) { // up
				index++;
			}
			else if (e.keyCode == 40) { // down
				index--;
			}
			var length = bg.layerImages.length;
			if (index < 0) {
				index += length;
			}
			index %= length;
			console.log('layer',index);
		});
	}

	var startPos;
	var startLayerX;
	var touchHandler = {
		start: function(x,y) {
			startPos = Ptero.screen.screenToSpace({x:x, y:y});
			startLayerX = bg.layerPositions[index].x;
		},
		move: function(x,y) {
			var dx = Ptero.screen.screenToSpace({x:x,y:y}).x - startPos.x;
			bg.layerPositions[index].x = startLayerX + dx;
			console.log(bg.layerPositions[index].x);
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
