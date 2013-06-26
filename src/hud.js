
Ptero.hud = (function(){

	function getAnchoredScreenPos(xAnchor,yAnchor,w,h,xPad,yPad) {
		var x,y;
		var screenW = Ptero.screen.getWidth();
		var screenH = Ptero.screen.getHeight();
		switch(xAnchor) {
			case "left": x=xPad; break;
			case "right": x=screenW-w-xPad; break;
			case "center": x=screenW/2-w/2; break;
			default: throw("unrecognized xAnchor");
		}
		switch(yAnchor) {
			case "top": y=yPad; break;
			case "bottom": y=screenH-h-yPad; break;
			case "center": y=screenH/2-h/2; break;
			default: throw("unrecognized yAnchor");
		}
		return {
			x: x,
			y: y,
		};
	}

	function getBorderPad() {
		return Ptero.screen.getHeight()/16;
	}

	function getBaseTextSize() {
		var h = Ptero.screen.getHeight();
		var size = Math.floor(h/10);
		return size;
	}

	function getTextSize(name) {
		var factors = {
			"menu_option": 0.75,
			"menu_title": 1.5,
		};
		var k = factors[name];
		if (k) {
			return k * getBaseTextSize();
		}
	}

	return {
		getAnchoredScreenPos: getAnchoredScreenPos,
		getBaseTextSize: getBaseTextSize,
		getBorderPad: getBorderPad,
		getTextSize: getTextSize,
	};

})();
