
Ptero.makeButton = function(sprite,xAnchor,yAnchor,xPad,yPad,onclick) {
	var size = sprite.billboard.getScreenSize();
	var w = size.w;
	var h = size.h;
	var screenPos = Ptero.hud.getAnchoredScreenPos(xAnchor, yAnchor, w,h, 10,10);
	screenPos.x += w/2;
	screenPos.y += h/2;
	var spacePos = Ptero.screen.screenToSpace(screenPos);
	return new Ptero.Button(sprite,spacePos,onclick);
}
Ptero.Button = function(sprite,pos,onclick) {
	this.pos = pos;
	this.onclick = onclick;
	this.sprite = sprite;

	var that = this;
	function isInside(x,y) {
		return sprite.billboard.isInsideScreenRect(x,y,that.pos);
	}
	this.touchHandler = (function(){
		var startInside = false;
		var lastX,lastY;
		return {
			start: function(x,y) {
				startInside = isInside(x,y);
				lastX = x;
				lastY = y;
			},
			move: function(x,y) {
				lastX = x;
				lastY = y;
			},
			end: function(x,y) {
				if (startInside && isInside(lastX,lastY)) {
					that.onclick();
				}
			},
			cancel: function(x,y) {
			},
		};
	})();
};

Ptero.Button.prototype = {
	enable: function() {
		Ptero.input.addTouchHandler(this.touchHandler);
	},
	disable: function() {
		Ptero.input.removeTouchHandler(this.touchHandler);
	},
	draw: function(ctx) {
		this.sprite.draw(ctx,this.pos);
	},
};
