
// A simple tool scene for positioning the background layers.

Ptero.scene_bgpos = (function(){

	var extremeIndex = null;
	var layerIndex = 0;
	var bg;

	var layerExtremes=[];

	var keys = {
		"EDIT_LEFT": 37, // left
		"EDIT_RIGHT": 39, // right
		"PRINT": 13, // enter
		"HIGHLIGHT": 16, // "4"
		"NEXT_LAYER": 38, // up
		"PREV_LAYER": 40, // down
	};

	function cleanup() {
		Ptero.input.removeTouchHandler(touchHandler);
	}

	var isHighlight = false;
	function setSelectedLayer(i) {
		layerIndex = i;
		var length = bg.layers.length;
		if (layerIndex < 0) {
			layerIndex += length;
		}
		layerIndex %= length;
		console.log('layer', layerIndex);

		if (isHighlight) {
			bg.setSelectedLayer(layerIndex);
		}
	}

	function initExtremes() {

		var i,len=bg.layers.length;

		if (bg == Ptero.bg_ice) {
			layerExtremes = [
				[-1.4952226540600921, -1.4938994481715433],
				[-1.4912530363944454, -1.3629020652052166],
				[-1.2504295646785724, -1.4925762422829942],
				[-1.4224463301899106, -1.4846370069517019],
				[-1.0360702107336746, -1.485960212840251],
				[-1.0003436517428579, -1.4819905951746044],
				[-1.016222122405443, -1.4700817421776655],
				[-0.49355579642868513, -1.4899298305058968],
				[0.26728758948684833, -1.4846370069517025],
				[1.4833138010631532, -1.4978690658371896],
			];
		}
		else {
			for (i=0; i<len; i++) {
				layerExtremes.push([0,0]);
			}
		}
		for (i=0; i<len; i++) {
			bg.layers[i].setX(layerExtremes[i][1]);
		}
	}

	function init() {
		bg = Ptero.bg_ice;
		Ptero.setBackground(bg);
		Ptero.background.setAnimating(false);
		initExtremes();

		Ptero.input.addTouchHandler(touchHandler);
		window.addEventListener('keyup', function(e) {
			if (e.keyCode == keys.EDIT_LEFT) {
				extremeIndex = null;
			}
			else if (e.keyCode == keys.EDIT_RIGHT) {
				extremeIndex = null;
			}
			else if (e.keyCode == keys.PRINT) {
				var i,len=bg.layers.length;
				for (i=0; i<len; i++) {
					console.log(layerExtremes[i]);
				}
			}
			else if (e.keyCode == keys.HIGHLIGHT) {
				isHighlight = false;	
				bg.setSelectedLayer(null);
			}
		});

		window.addEventListener('keydown', function(e) {
			if (e.shiftKey) {
				isHighlight = true;
				setSelectedLayer(layerIndex);
			}

			if (e.keyCode == keys.EDIT_LEFT) {
				extremeIndex = 0;
				setToExtremes();
			}
			else if (e.keyCode == keys.EDIT_RIGHT) {
				extremeIndex = 1;
				setToExtremes();
			}
			else if (e.keyCode == keys.NEXT_LAYER) {
				setSelectedLayer(layerIndex+1);
			}
			else if (e.keyCode == keys.PREV_LAYER) {
				setSelectedLayer(layerIndex-1);
			}
		});
	}

	function setPosition(x) {
		var i,len = bg.layers.length;
		var x0,x1,x2;
		for (i=0; i<len; i++) {
			x0 = layerExtremes[i][0];
			x1 = layerExtremes[i][1];
			x2 = x0 + (x1-x0) * (x/Ptero.screen.getWidth());
			bg.layers[i].setX(x2);
		}
	}

	function setToExtremes() {
		var i,len = bg.layers.length;
		for (i=0; i<len; i++) {
			bg.layers[i].setX(layerExtremes[i][extremeIndex]);
		}
	}

	var startPos;
	var startLayerX;
	var mode;
	var touchHandler = {
		start: function(x,y) {
			mode = null;

			if (isHighlight) {
				var i = bg.getLayerFromPixel(x,y);
				if (i != null) {
					setSelectedLayer(i);
				}
				if (extremeIndex != null) {
					mode = 'extreme';
					startPos = Ptero.screen.screenToSpace({x:x, y:y});
					startLayerX = layerExtremes[layerIndex][extremeIndex];
				}
			}
			else if (extremeIndex == null) {
				mode = 'position';
				setPosition(x);
			}
			else {
				mode = 'extreme';
				startPos = Ptero.screen.screenToSpace({x:x, y:y});
				startLayerX = layerExtremes[layerIndex][extremeIndex];
			}
		},
		move: function(x,y) {
			if (mode == 'position') {
				setPosition(x);
			}
			else if (mode == 'extreme') {
				var dx = Ptero.screen.screenToSpace({x:x,y:y}).x - startPos.x;
				layerExtremes[layerIndex][extremeIndex] = startLayerX + dx;
				console.log(layerExtremes[layerIndex][extremeIndex]);
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
		Ptero.deferredSprites.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
	};

})();
