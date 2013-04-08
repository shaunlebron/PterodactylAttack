
Ptero.SpriteTable = function(img,dict) {
	this.img = img;

	this.rows = dict.rows;
	this.cols = dict.cols;
	this.frames = dict.frames;
	this.fps = dict.fps;

	this.tileWidth = img.width / this.cols;
	this.tileHeight = img.height / this.rows;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	this.tileCenterX = this.tileWidth * dict.centerX;
	this.tileCenterY = this.tileHeight * dict.centerY;
};

Ptero.SpriteTable.prototype = {
	draw: function(ctx,pos,frame) {
		var row = Math.floor(frame / this.cols);
		var col = frame % this.cols;
		var sx = col * this.tileWidth;
		var sy = row * this.tileHeight;
		var sw = this.tileWidth;
		var sh = this.tileHeight;
		Ptero.painter.drawImageFrame(
			ctx,
			this.img,
			pos,
			sx,sy,sw,sh,
			this.billboard
		);
	},
	drawBorder: function(ctx,pos,color,handle) {
		Ptero.painter.drawBorder(ctx,pos,color,this.billboard,handle);
	},
};

Ptero.Sprite = function(img,dict) {
	this.img = img;

	if (dict.centerX == undefined) dict.centerX = 0.5;
	if (dict.centerY == undefined) dict.centerY = 0.5;

	this.centerX = img.width * dict.centerX;
	this.centerY = img.height * dict.centerY;
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

Ptero.AnimSprite = function(table) {
	this.table = table;

	this.frameDuration = 1/this.table.fps;
	this.totalDuration = this.frameDuration * table.frames;
	this.time = 0;
	this.frame = 0;

	this.animating = true;
	this.repeat = true;
};

Ptero.AnimSprite.prototype = {
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
	draw: function(ctx,pos) {
		this.table.draw(ctx,pos,this.frame);
	},
	drawBorder: function(ctx,pos,color,handle) {
		this.table.drawBorder(ctx,pos,color,handle);
	},
	getBillboard: function() {
		return this.table.billboard;
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

