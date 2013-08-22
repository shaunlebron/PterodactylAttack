
Ptero.Button = function(a) {

	// get billboard or build a new one from the given size
	this.billboard = a.billboard || (
		new Ptero.Billboard(a.width/2, a.height/2, a.width, a.height, 1)
	);

	var hudPos = a.hudPos && Ptero.screen.screenToSpace({
			x: a.hudPos.x * Ptero.screen.getWidth(),
			y: a.hudPos.y * Ptero.screen.getHeight(),
	});

	this.isEnabled = false;

	// get position or calculate it from the given anchor and margin.
	this.pos = a.pos || hudPos || (function(){
		var size = this.billboard.getScreenSize();
		var w = size.w;
		var h = size.h;

		// make sure margin has x and y components
		var margin = a.margin || 0;
		if (typeof margin == "number") {
			margin = { x: margin, y: margin };
		}

		// get screen position of topleft corner
		var screenPos = Ptero.hud.getAnchoredScreenPos(
			a.anchor.x, a.anchor.y,
			w, h,
			margin.x, margin.y);

		// get screen position of midpoint
		screenPos.x += w/2;
		screenPos.y += h/2;

		// return space position
		return Ptero.screen.screenToSpace(screenPos);
	}).call(this);
	this.onclick = a.onclick;
	this.ontouchstart = a.ontouchstart;
	this.ontouchend = a.ontouchend;
	this.ontouchenter = a.ontouchenter;
	this.ontouchleave = a.ontouchleave;

	// Create touch handler
	var that = this;
	this.touchHandler = (function(){
		var startInside = false;
		var lastX,lastY;
		function isInside(x,y) {
			return that.billboard.isInsideScreenRect(x,y,that.pos);
		}
		var startIndex = null;
		return {
			start: function(x,y,i) {
				if (startIndex != null) {
					return;
				}

				startInside = isInside(x,y);
				lastX = x;
				lastY = y;
				if (startInside) {
					startIndex = i;
					that.ontouchstart && that.ontouchstart(x,y);
				}
				else {
					startIndex = null;
				}
			},
			move: function(x,y,i) {
				if (startIndex != i) {
					return;
				}

				lastX = x;
				lastY = y;
				if (startInside) {
					if (isInside(x,y,i)) {
						that.ontouchenter && that.ontouchenter(x,y);
					}
					else {
						that.ontouchleave && that.ontouchleave(x,y);
					}
				}
			},
			end: function(x,y,i) {
				if (startIndex != i) {
					return;
				}

				if (startInside) {
					that.ontouchend && that.ontouchend(x,y);
					if (isInside(lastX,lastY)) {
						if (a.isClickDelay) {
							setTimeout(function(){
								that.onclick && that.onclick();
							}, 250);
						}
						else {
							that.onclick && that.onclick();
						}
					}
				}

				startIndex = null;
			},
			cancel: function(x,y,i) {
			},
		};
	})();
};
Ptero.Button.prototype = {
	drawBorder: function(ctx) {
		Ptero.painter.drawBorder(ctx,this.pos,"#F00",this.billboard);
	},
	enable: function() {
		if (!this.isEnabled) {
			Ptero.input.addTouchHandler(this.touchHandler);
			this.isEnabled = true;
		}
	},
	disable: function() {
		if (this.isEnabled) {
			Ptero.input.removeTouchHandler(this.touchHandler);
			this.isEnabled = false;
		}
	},
};

Ptero.TextButton = function(a) {

	this.billboard = a.billboard || (
		new Ptero.Billboard(a.width/2, a.height/2, a.width, a.height, 1)
	);

	this.fontSprite = a.fontSprite;
	this.textAlign = a.textAlign || "center";
	this.text = a.text;

	var ontouchstart = a.ontouchstart;
	var ontouchend = a.ontouchend;
	var ontouchenter = a.ontouchenter;
	var ontouchleave = a.ontouchleave;

	var origScale = this.billboard.scale;
	var focusScale = origScale * 1.1;
	this.origScale = this.activeScale = origScale;
	var that = this;
	function setScale(s) {
		//a.sprite.billboard.scale = s;
		that.activeScale = s;
	}
	
	a.ontouchstart = function() {
		setScale(focusScale);
		ontouchstart && ontouchstart();
	};
	a.ontouchend = function() {
		setScale(origScale);
		ontouchend && ontouchend();
	};
	a.ontouchenter = function() {
		setScale(focusScale);
		ontouchenter && ontouchenter();
	};
	a.ontouchleave = function() {
		setScale(origScale);
		ontouchleave && ontouchleave();
	};

	Ptero.Button.call(this,a);
};

Ptero.TextButton.prototype = newChildObject(Ptero.Button.prototype, {
	draw: function(ctx) {
		var backupScale = this.billboard.scale;
		this.billboard.scale = this.activeScale;
		if (this.text) {
			this.fontSprite.draw(ctx, this.text, this.billboard, this.pos, this.textAlign);
		}
		this.billboard.scale = backupScale;
	},
});

Ptero.SpriteButton = function(a) {
	this.sprite = a.sprite;
	a.billboard = a.sprite.billboard;
	Ptero.TextButton.call(this,a);
};
Ptero.SpriteButton.prototype = newChildObject(Ptero.TextButton.prototype, {
	draw: function(ctx) {
		var backupScale = this.billboard.scale;
		this.billboard.scale = this.activeScale;
		this.sprite.draw(ctx,this.pos);
		if (this.text) {
			this.fontSprite.draw(ctx, this.text, this.billboard, this.pos, this.textAlign);
		}
		this.billboard.scale = backupScale;
	},
});

