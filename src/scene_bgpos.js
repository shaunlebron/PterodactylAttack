
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
		"NEXT_BG": 80, // P
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

		if (bg.name == 'ice') {
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
		else if (bg.name == 'mountain') {
			layerExtremes = [
				[-2.1316846864520427, -2.2454803928672358],
				[-2.2640052753069186, -1.9027700677331085],
				[-1.851165038079707, -2.240187569313041],
				[-2.3050246578519293, -2.0390602742536306],
				[-1.2279350645732436, -1.3999518300845817],
				[-2.2071074220993223, -2.226955510427553],
				[-2.8620943369309546, -2.602745982775399],
				[-1.786327949540818, -2.0311210389223375],
				[-2.3354583932885506, -1.501838683502836],
				[-1.796913596649208, -2.570989041450228],
				[-1.1961781232480735, -2.265328481195467],
				[-2.7178648950791406, -1.8471954204140615],
				[-0.9275673278726766, -2.205784216210773],
				[-0.21568255983344659, -2.373831364056464],
				[0.3982849724531744, -2.2626820694183687],
				[2.271944510638211, -2.289146187189344],
			];
		}
		else if (bg.name == 'volcano') {
			layerExtremes = [
				[-0.9752027398604316, -0.9752027398604316],
				[-0.9619706809749442, -0.9778491516375293],
				[-0.9831419751917242, -0.9871115928573705],
				[-0.9685867104176882, -0.985788386968822],
				[-0.939476180869615, -0.988434798745919],
				[-0.8971335924360551, -0.9857883869688215],
				[-0.8481749745597511, -0.9844651810802728],
				[-0.4340115314439912, -0.9871115928573704],
				[-0.5319287671965991, -0.9897580046344682],
				[-0.14290623596326546, -0.9791723575260779],
				[0.958001063309298, -0.9765259457489804],
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

	function setBg(name) {
		bg = Ptero.setBackground(name);
		bg.setAnimating(false);
		initExtremes();
	}

	function nextBg() {
		var names = [
			"mountain",
			"ice",
			"volcano",
		];
		var currName = Ptero.background.name;
		var i,len=names.length;
		for (i=0; i<len; i++) {
			if (names[i] == currName) {
				setBg(names[(i+1)%len]);
			}
		}
	}

	function init() {
		setBg('mountain');

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
			else if (e.keyCode == keys.NEXT_BG) {
				nextBg();
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
			x2 = x0 + (x1-x0) * (x/Ptero.screen.getWindowWidth());
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
					startPos = Ptero.screen.windowToSpace({x:x, y:y});
					startLayerX = layerExtremes[layerIndex][extremeIndex];
				}
			}
			else if (extremeIndex == null) {
				mode = 'position';
				setPosition(x);
			}
			else {
				mode = 'extreme';
				startPos = Ptero.screen.windowToSpace({x:x, y:y});
				startLayerX = layerExtremes[layerIndex][extremeIndex];
			}
		},
		move: function(x,y) {
			if (mode == 'position') {
				setPosition(x);
			}
			else if (mode == 'extreme') {
				var dx = Ptero.screen.windowToSpace({x:x,y:y}).x - startPos.x;
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
