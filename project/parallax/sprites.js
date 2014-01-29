/*

Here we define structures for managing various sprites.

*/
Ptero.VectorSprite = function(dict) {

	var vectorPathData = dict.vectorPathData;
	this.isShape = vectorPathData.shapeCompatible;
	this.paths = vectorPathData.paths;

	// Create a preset shape that Cocoon's HTML5 Path API allows for fast vector drawing.
	if (navigator.isCocoonJS && this.isShape) {
		var i,len=this.paths.length;
		this.shape = new Shape();
		for (i=0; i<len; i++) {
			var path = new Path();
			this.paths[i](path);
			// compensate for cocoon's erroneous doubling of line width
			if (path.lineWidth) {
				path.lineWidth /= 2;
			}
			this.shape.addPath(path);
		}
	}

	this.width = dict.width;
	this.height = dict.height;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	var centerX = this.width * dict.centerX;
	var centerY = this.height * dict.centerY;

	this.billboard = new Ptero.Billboard(
		centerX,
		centerY,
		this.width,
		this.height,
		(dict.scale || 1));
}

Ptero.VectorSprite.prototype = {
	isPixelInside: function(pos,x,y) {
		if (!this.paths) {
			return;
		}

		var ctx = Ptero.screen.getCtx();

		ctx.save();
		this.billboard.transform(ctx, pos);

		var isInside = false;
		var i,len=this.paths.length;
		for (i=0; i<len; i++) {
			this.paths[i](ctx);
			if (ctx.isPointInPath(x,y)) {
				isInside = true;
				break;
			}
		}

		ctx.restore();

		return isInside;
	},
	draw: function(ctx,pos,color) {

		if (this.sprite) {
			// draw bitmap (see assets.js:postProcessVector)
			if (this.redSprite && color == 'red') {
				this.redSprite.draw(ctx,pos);
			}
			else if (this.whiteSprite && color == 'white') {
				this.whiteSprite.draw(ctx,pos);
			}
			else {
				this.sprite.draw(ctx,pos);
			}
		}
		else {
			// draw vector
			ctx.save();
			this.billboard.transform(ctx, pos);

			if (this.shape) {
				ctx.fillShape(this.shape);
			}
			else if (this.paths) {
				var i,len=this.paths.length;
				for (i=0; i<len; i++) {
					ctx.save();
					this.paths[i](ctx);
					if (ctx.strokeStyle) {
						ctx.stroke();
					}
					ctx.fill();
					ctx.restore();
				}
			}

			ctx.restore();
		}
	},
};

Ptero.Sprite = function(img,dict) {
	this.img = img;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	var centerX = img.width * dict.centerX;
	var centerY = img.height * dict.centerY;
	this.billboard = new Ptero.Billboard(
		centerX,
		centerY,
		img.width,
		img.height,
		(dict.scale || 1));
};

Ptero.Sprite.prototype = {
	draw: function(ctx,pos) {
		Ptero.painter.drawImage(
			ctx,
			this.img,
			pos,
			this.billboard
		);
	},
	drawBorder: function(ctx,pos,color,handle) {
		Ptero.painter.drawBorder(ctx,pos,color,this.billboard,handle);
	},
};

Ptero.AnimSprite = function(dict) {
	if (dict.vectorAnim) {
		this.vectorAnim = dict.vectorAnim;
		this.frameDuration = 1/this.vectorAnim.fps;
		this.totalDuration = this.frameDuration * this.vectorAnim.frames.length;
	}

	this.time = 0;
	this.frame = 0;

	this.animating = true;
	this.repeat = true;
};

Ptero.AnimSprite.prototype = {
	isPixelInside: function(pos,x,y) {
		if (this.vectorAnim) {
			var name = this.vectorAnim.frames[this.frame];
			var result = Ptero.assets.vectorSprites[name].isPixelInside(pos,x,y);
			return result;
		}
		else {
			return this.getBillboard().isInsideScreenRect(x,y,pos);
		}
	},
	shuffleTime: function() {
		this.time = Math.random()*this.totalDuration;
	},
	start: function start() {
		this.animating = true;
	},
	restart: function restart() {
		this.reset();
		this.start();
	},
	stop: function stop() {
		this.animating = false;
	},
	reset: function reset() {
		this.time = 0;
	},
	setRepeat: function setRepeat(on) {
		this.repeat = on;
	},
	setFinishCallback: function setFinishCallback(callback) {
		this.onFinish = callback;
	},
	isDone: function isDone() {
		return (this.time >= this.totalDuration);
	},
	setTime: function(t) {
		this.time = t % this.totalDuration;
		this.frame = Math.floor(this.time / this.frameDuration);
	},
	update: function update(dt) {
		if (!this.animating) {
			return;
		}

		this.time += dt;
		if (this.time >= this.totalDuration) {
			this.onFinish && this.onFinish();
			if (!this.repeat) {
				this.stop();
				return;
			}
		}

		this.time %= this.totalDuration;
		this.frame = Math.floor(this.time / this.frameDuration);
	},
	draw: function(ctx,pos,frame) {
		if (frame == undefined) {
			frame = this.frame;
		}
		if (this.table) {
			this.table.draw(ctx,pos,frame);
		}
		else if (this.mosaic) {
			this.mosaic.draw(ctx,pos,this.mosaic.frame_names[frame]);
		}
		else if (this.vectorAnim) {
			var name = this.vectorAnim.frames[frame];
			Ptero.assets.vectorSprites[name].draw(ctx,pos);
		}
	},
	drawBorder: function(ctx,pos,color,handle) {
		if (this.table) {
			this.table.drawBorder(ctx,pos,color,handle);
		}
	},
	getBillboard: function() {
		if (this.table) {
			return this.table.billboard;
		}
		else if (this.mosaic) {
			return this.mosaic.billboard;
		}
		else if (this.vectorAnim) {
			var name = this.vectorAnim.frames[this.frame];
			return Ptero.assets.vectorSprites[name].billboard;
		}
	},
};

// Deferred sprites allow for drawing the sprites in a correct order.
// This allows closer sprites to be drawn over those further away.
Ptero.deferredSprites = (function(){
	var sprites=[];
	var len=0;
	function clear() {
		sprites.length = 0;
		len = 0;
	};
	function defer(draw,z) {
		sprites[len++] = {draw:draw, z:z};
	};
	function finalize() {
		sprites.sort(function(a,b) { return b.z - a.z; });
	};
	function draw(ctx) {
		var i;
		for (i=0; i<len; i++) {
			sprites[i].draw(ctx);
		}
	};
	return {
		clear: clear,
		defer: defer,
		finalize: finalize,
		draw: draw,
	};
})();

