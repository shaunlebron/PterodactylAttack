// We try to remove the complexity of drawing a front-facing texture
// in the frustum by creating the notion of a "billboard".
// A billboard is a fixed-size rectangle that has a desired scale.
// All scales are relative to the background scale, since we use it
// to determine the aspect ratio of the game.

Ptero.Billboard = function(x,y,w,h,scale) {
	this.setCenter(x,y);
	this.setSize(w,h);
	this.scale = (scale == undefined) ? 1 : scale;
};

Ptero.Billboard.prototype = {
	setSize: function(w,h) {
		this.w = w;
		this.h = h;
	},
	setCenter: function(x,y) {
		this.centerX = x;
		this.centerY = y;
	},
	normalizePos: function(pos, destCoord) {
		var currCoord = (pos.z == undefined) ? "window" : "space";
		if (currCoord == destCoord) {
			return pos;
		}
		if (currCoord == "window" && destCoord == "space") {
			return Ptero.screen.windowToSpace(pos);
		}
		if (currCoord == "space" && destCoord == "window") {
			return Ptero.screen.spaceToWindow(pos);
		}
	},
	getTileSpaceRect: function(pos, sx, sy, sw, sh) {
		var spacePos = this.normalizePos(pos, "space");
		var scale = this.scale / Ptero.frustum.scale;
		var w = sw * scale;
		var h = sh * scale;
		var x = spacePos.x - this.centerX*scale + sx*scale;
		var y = spacePos.y - this.centerY*scale + (this.h-(sy+sh))*scale;
		var z = spacePos.z;
		return {
			w: w,
			h: h,
			x: x,
			y: y,
			z: z,
			bl: {x:x, y:y, z:z},
			br: {x:x+w, y:y, z:z},
			tl: {x:x, y:y+h, z:z},
			tr: {x:x+w, y:y+h, z:z},
		};
	},
	getSpaceRect: function(pos) {
		var spacePos = this.normalizePos(pos, "space");
		var scale = this.scale / Ptero.frustum.scale;
		var w = this.w * scale;
		var h = this.h * scale;
		var x = spacePos.x - this.centerX*scale;
		var y = spacePos.y - this.centerY*scale;
		var z = spacePos.z;
		return {
			w: w,
			h: h,
			x: x,
			y: y,
			z: z,
			bl: {x:x, y:y, z:z},
			br: {x:x+w, y:y, z:z},
			tl: {x:x, y:y+h, z:z},
			tr: {x:x+w, y:y+h, z:z},
		};
	},
	getNearRect: function(pos) {
		var spacePos = this.normalizePos(pos, "space");
		var scale = this.scale / Ptero.frustum.scale / pos.z * Ptero.frustum.near;
		return {
			w: this.w * scale,
			h: this.h * scale,
			x: spacePos.x - this.centerX*scale,
			y: spacePos.y - this.centerY*scale,
			z: Ptero.frustum.near,
		};
	},
	getWindowSize: function() {
		return {
			w: this.w * this.scale,
			h: this.h * this.scale,
		};
	},
	getWindowRect: function(pos) {
		var windowPos = this.normalizePos(pos, "window");
		var spacePos = this.normalizePos(pos, "space");
		var scale = this.scale / spacePos.z * Ptero.frustum.near;
		return {
			centerX: windowPos.x,
			centerY: windowPos.y,
			w: this.w * scale,
			h: this.h * scale,
			x: windowPos.x - this.centerX*scale,
			y: windowPos.y - this.centerY*scale,
			scale: scale,
		};
	},
	getCanvasRect: function(pos) {
		var windowPos = this.normalizePos(pos, "window");
		var spacePos = this.normalizePos(pos, "space");
		var canvasPos = Ptero.screen.windowToCanvas(windowPos.x, windowPos.y);
		var scale = this.scale / spacePos.z * Ptero.frustum.near * Ptero.screen.getWindowScale();
		return {
			centerX: canvasPos.x,
			centerY: canvasPos.y,
			w: this.w * scale,
			h: this.h * scale,
			x: canvasPos.x - this.centerX*scale,
			y: canvasPos.y - this.centerY*scale,
		};
	},
	getRelativeCursor: function(x,y,pos) {
		var rect = this.getWindowRect(pos);

		// TODO: use center pos for this billboard instead of assuming we're in the perfect center.
		var midx = rect.x + rect.w/2;
		var midy = rect.y + rect.h/2;
		x -= midx;
		y -= midy;
		var nx,ny;
		
		// (x+yi)(cos + isin)
		// (xcos + ixsin + iycos - ysin)
		if (pos.angle) {
			var c = Math.cos(-pos.angle);
			var s = Math.sin(-pos.angle);
			nx = x*c - y*s;
			ny = x*s + y*c;
		}
		else {
			nx = x;
			ny = y;
		}

		nx += rect.w/2;
		ny += rect.h/2;
		return {x:nx, y:ny};
	},

	isInsideWindowRect: function(wx,wy,pos) {
		var rect = this.getWindowRect(pos);
		var p = this.getRelativeCursor(wx,wy,pos);
		if (0 <= p.x && p.x <= rect.w &&
			0 <= p.y && p.y <= rect.h) {
			return true;
		}
		return false;
	},
	isInsideCanvasRect: function(cx,cy,pos) {
		var rect = this.getCanvasRect(pos);
		return (
			rect.x <= cx && cx <= (rect.x + rect.w) &&
			rect.y <= cy && cy <= (rect.y + rect.h));
	},

	setBottomSide: function(wy, windowPos) {
		var rect = this.getWindowRect(windowPos);
		wy = Math.max(rect.y+1, wy);
		var relativeCenterY = this.centerY / this.h;
		this.h = (wy - rect.y) / this.scale;
		this.centerY = this.h * relativeCenterY;
		windowPos.y = rect.y + this.centerY * this.scale;
	},

	setTopSide: function(wy, windowPos) {
		var rect = this.getWindowRect(windowPos);
		wy = Math.min(rect.y+rect.h-1, wy);
		var relativeCenterY = this.centerY / this.h;
		this.h = (rect.y + rect.h - wy) / this.scale;
		this.centerY = this.h * relativeCenterY;
		windowPos.y = wy + this.centerY * this.scale;
	},

	setLeftSide: function(wx, windowPos) {
		var rect = this.getWindowRect(windowPos);
		wx = Math.min(rect.x+rect.w-1, wx);
		var relativeCenterX = this.centerX / this.w;
		this.w = (rect.x + rect.w - wx) / this.scale;
		this.centerX = this.w * relativeCenterX;
		windowPos.x = wx + this.centerX * this.scale;
	},

	setRightSide: function(wx, windowPos) {
		var rect = this.getWindowRect(windowPos);
		wx = Math.max(rect.x+1, wx);
		var relativeCenterX = this.centerX / this.w;
		this.w = (wx - rect.x) / this.scale;
		this.centerX = this.w * relativeCenterX;
		windowPos.x = rect.x + this.centerX * this.scale;
	},

	isOverRotationHandle: function(x,y,pos) {
		var rect = this.getWindowRect(pos);
		var p = this.getRelativeCursor(x,y,pos);
		var dx = (rect.w/2) - p.x;
		var dy = 0 - p.y;
		var dist_sq = dx*dx+dy*dy;
		return dist_sq <= 64;
	},

	transform: function(ctx,pos) {
		var rect = this.getWindowRect(pos);
		ctx.translate(rect.centerX, rect.centerY);
		if (pos.angle) {
			ctx.rotate(pos.angle);
		}
		ctx.translate(-this.centerX*rect.scale, -this.centerY*rect.scale);
		var scale = rect.w / this.w;
		ctx.scale(scale, scale);
	},

	fill: function(ctx,pos) {
		var r = this.getWindowRect(pos);
		ctx.fillRect(r.x,r.y,r.w,r.h);
	},
};
