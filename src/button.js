
Ptero.makeSpriteButton = function(sprite,xAnchor,yAnchor,xPad,yPad,onclick) {
	var size = sprite.billboard.getScreenSize();
	var w = size.w;
	var h = size.h;
	var screenPos = Ptero.hud.getAnchoredScreenPos(xAnchor, yAnchor, w,h, xPad, yPad);
	screenPos.x += w/2;
	screenPos.y += h/2;
	var spacePos = Ptero.screen.screenToSpace(screenPos);
	return new Ptero.SpriteButton(sprite,spacePos,onclick);
}

Ptero.makeTextButton = function(text,w,h,font,color,align,xAnchor,yAnchor,xPad,yPad,onclick) {

	var billboard = new Ptero.Billboard(w/2,h/2,w,h,1);
	var size = billboard.getScreenSize();
	w = size.w;
	h = size.h;

	var screenPos = Ptero.hud.getAnchoredScreenPos(xAnchor, yAnchor, w,h, xPad,yPad);
	screenPos.x += w/2;
	screenPos.y += h/2;
	var spacePos = Ptero.screen.screenToSpace(screenPos);
	return new Ptero.TextButton(font,color,text,align,billboard,spacePos,onclick);
}

Ptero.Button = function(billboard,pos,onclick) {
	this.pos = pos;
	this.onclick = onclick;
	this.billboard = billboard;

	var that = this;
	function isInside(x,y) {
		return billboard.isInsideScreenRect(x,y,that.pos);
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
};

Ptero.SpriteButton = function(sprite,pos,onclick) {
	Ptero.Button.call(this,sprite.billboard,pos,onclick);
	this.sprite = sprite;
};
Ptero.SpriteButton.prototype = newChildObject(Ptero.Button.prototype, {
	draw: function(ctx) {
		this.sprite.draw(ctx,this.pos);
	},
});

Ptero.TextButton = function(font,color,text,align,billboard,pos,onclick) {
	Ptero.Button.call(this,billboard,pos,onclick);
	this.font = font;
	this.color = color;
	this.text = text;
	this.align = align;
	this.billboard = billboard;
	this.pos = pos;
}
Ptero.TextButton.prototype = newChildObject(Ptero.Button.prototype, {
	draw: function(ctx) {
		ctx.font = this.font;
		ctx.textBaseline = "middle";
		ctx.textAlign = this.align;

		var rect = this.billboard.getScreenRect(this.pos);
		ctx.strokeStyle = this.color;
		ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
		var y = rect.centerY;
		var r = 2;
		var pad = 10;
		var x;
		switch(this.align) {
			case "left": x = rect.x+pad; break;
			case "right": x = rect.x+rect.w-pad; break;
			case "center": x = rect.centerX; break;
			default: throw("unrecognized text alignment "+this.align);
		}

		ctx.fillStyle = "#000";
		ctx.fillText(this.text, x+r,y+r);

		ctx.fillStyle = this.color;
		ctx.fillText(this.text, x,y);
	},
});
