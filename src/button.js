Ptero.ButtonList = function(dict) {
	// this is the ordered list of all the buttons
	this.buttons = [];

	// this is a dictionary mapping names to buttons
	// Since only the interactive buttons require names for attaching events,
	// it follows that only named buttons have to be enabled and disabled.
	this.namedButtons = {};

	// create the buttons
	var i,len=dict.objects.length;
	var btn;
	for (i=0; i<len; i++) {
		var state = dict.objects[i];
		var btn = Ptero.Button.fromState(state);
		btn.shouldDraw = true;
		this.buttons.push(btn);
		if (state.name) {
			this.namedButtons[state.name] = btn;
		}
	}
};

Ptero.ButtonList.prototype = {
	enable: function() {
		var name;
		for (name in this.namedButtons) {
			this.namedButtons[name].enable();
		}
	},
	disable: function() {
		var name;
		for (name in this.namedButtons) {
			this.namedButtons[name].disable();
		}
	},
	draw: function(ctx) {
		var i,len=this.buttons.length;
		var btn;
		for (i=0; i<len; i++) {
			btn = this.buttons[i];
			btn.shouldDraw && btn.draw(ctx);
		}
	},
};

Ptero.Button = function(a) {

	this.billboard  = a.billboard;
	this.pos        = a.pos;
	this.image      = a.image;
	this.fontSprite = a.fontSprite;
	this.textAlign  = a.textAlign;
	this.text       = a.text;

	this.isClickDelay = a.isClickDelay;

	this.isEnabled    = false;

	// initialize button click events (can be overwritten)
	this.onclick      = a.onclick;
	this.ontouchstart = a.ontouchstart;
	this.ontouchend   = a.ontouchend;
	this.ontouchenter = a.ontouchenter;
	this.ontouchleave = a.ontouchleave;

	// scale state for growing/shrinking button for reacting to touch events
	var origScale  = this.billboard.scale;
	var focusScale = origScale * 1.1;
	this.origScale = this.activeScale      = origScale;
	var that = this;
	function setScale(s) {
		that.activeScale = s;
	}
	
	// wrapper functions that delegate to user-defined click events
	// while capturing them for scaling the button for touch events
	var that = this;
	this.touchstart = function() {
		setScale(focusScale);
		that.ontouchstart && that.ontouchstart();
	};
	this.touchend = function() {
		setScale(origScale);
		that.ontouchend && that.ontouchend();
	};
	this.touchenter = function() {
		setScale(focusScale);
		that.ontouchenter && that.ontouchenter();
	};
	this.touchleave = function() {
		setScale(origScale);
		that.ontouchleave && that.ontouchleave();
	};

	// Create touch handler
	this.touchHandler = (function(){
		var startInside = false;
		var lastX,lastY;
		function isInside(x,y) {
			return that.billboard.isInsideWindowRect(x,y,that.pos);
		}
		var startIndex = null;
		return {
			coord: "window",
			start: function(x,y,i) {
				if (startIndex != null) {
					return;
				}

				startInside = isInside(x,y);
				lastX = x;
				lastY = y;
				if (startInside) {
					startIndex = i;
					that.touchstart(x,y);
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
						that.touchenter(x,y);
					}
					else {
						that.touchleave(x,y);
					}
				}
			},
			end: function(x,y,i) {
				if (startIndex != i) {
					return;
				}

				if (startInside) {
					that.touchend(x,y);
					if (isInside(lastX,lastY)) {
						if (that.isClickDelay) {
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

Ptero.Button.fromState = function(state) {
	var windowWidth = Ptero.screen.getWindowWidth();
	var windowHeight = Ptero.screen.getWindowHeight();
	var a = {
		pos: Ptero.screen.windowToSpace({ x: state.x * windowWidth, y: state.y * windowHeight}),
		billboard: new Ptero.Billboard(state.centerX, state.centerY, state.w, state.h),
		image: Ptero.assets.images[state.imageName],
		fontSprite: Ptero.assets.fonts[state.font],
		textAlign: state.textAlign,
		text: state.text,
	};
	var btn = new Ptero.Button(a);
	return btn;
};

Ptero.Button.prototype = {
	draw: function(ctx) {
		var backupScale = this.billboard.scale;
		this.billboard.scale = this.activeScale;
		if (this.image) {
			Ptero.painter.drawImage(ctx, this.image, this.pos, this.billboard);
		}
		if (this.text) {
			this.fontSprite.draw(ctx, this.text, this.billboard, this.pos, this.textAlign);
		}
		this.billboard.scale = backupScale;
	},
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
