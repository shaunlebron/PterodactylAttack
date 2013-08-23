
Ptero.hud = (function(){

	function getAnchoredScreenPos(xAnchor,yAnchor,w,h,xPad,yPad) {
		var x,y;
		var screenW = Ptero.screen.getWindowWidth();
		var screenH = Ptero.screen.getWindowHeight();
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
		return Ptero.screen.getWindowHeight()/16;
	}

	return {
		getAnchoredScreenPos: getAnchoredScreenPos,
		getBorderPad: getBorderPad,
	};

})();
