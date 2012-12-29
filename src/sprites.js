
Ptero.SpriteSheet = function(img,rows,cols,frames) {
	this.img = img;
	this.rows = rows;
	this.cols = cols;
	this.frames = frames;

	this.tileWidth = img.width / cols;
	this.tileHeight = img.height / rows;
};

Ptero.SpriteSheet.prototype = {
	draw: function(ctx,x,y,frame,scale) {
		if (scale == undefined) {
			scale = 1;
		}
		var row = Math.floor(frame / this.cols);
		var col = frame % this.cols;
		var sx = col * this.tileWidth;
		var sy = row * this.tileHeight;
		var sw = this.tileWidth;
		var sh = this.tileHeight;
		var dw = sw*scale;
		var dh = sh*scale;
		ctx.drawImage(this.img,
			sx,sy,sw,sh,
			x,y,dw,dh);
	},
};

Ptero.AnimSprite = function(sheet,fps) {
	this.sheet = sheet;
	this.fps = fps;

	this.frameDuration = 1/fps;
	this.totalDuration = this.frameDuration * sheet.frames;
	this.time = 0;
	this.frame = 0;
};

Ptero.AnimSprite.prototype = {
	update: function(dt) {
		this.time += dt;
		this.time %= this.totalDuration;
		this.frame = Math.floor(this.time / this.frameDuration);
	},
	draw: function(ctx,x,y,scale) {
		if (this.centered) {
			x -= this.sheet.tileWidth*scale/2;
			y -= this.sheet.tileHeight*scale/2;
		}
		this.sheet.draw(ctx,x,y,this.frame,scale);
	},
	setCentered: function(on) {
		this.centered = on;
	},
};

