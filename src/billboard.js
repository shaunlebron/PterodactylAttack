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
	getTileSpaceRect: function(pos, sx, sy, sw, sh) {
		var frustum = Ptero.screen.getFrustum();
		var scale = this.scale * Ptero.screen.getScale();
		scale /= Ptero.screen.getScreenToSpaceRatio();
		var w = sw * scale;
		var h = sh * scale;
		var x = pos.x - this.centerX*scale + sx*scale;
		var y = pos.y - this.centerY*scale + (this.h-(sy+sh))*scale;
		var z = pos.z;
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
		var frustum = Ptero.screen.getFrustum();
		var scale = this.scale * Ptero.screen.getScale();
		scale /= Ptero.screen.getScreenToSpaceRatio();
		var w = this.w * scale;
		var h = this.h * scale;
		var x = pos.x - this.centerX*scale;
		var y = pos.y - this.centerY*scale;
		var z = pos.z;
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
		var frustum = Ptero.screen.getFrustum();
		var scale = this.scale * Ptero.screen.getScale();
		scale /= Ptero.screen.getScreenToSpaceRatio();
		scale = scale / pos.z * frustum.near;
		return {
			w: this.w * scale,
			h: this.h * scale,
			x: pos.x - this.centerX*scale,
			y: pos.y - this.centerY*scale,
			z: frustum.near,
		};
	},
	getScreenSize: function() {
		var scale = this.scale * Ptero.screen.getScale();
		return {
			w: this.w * scale,
			h: this.h * scale,
		};
	},
	getScreenRect: function(pos) {
		var frustum = Ptero.screen.getFrustum();
		var screenPos = Ptero.screen.spaceToScreen(pos);
		var scale = this.scale * Ptero.screen.getScale();
		scale = scale / pos.z * frustum.near;
		return {
			centerX: screenPos.x,
			centerY: screenPos.y,
			w: this.w * scale,
			h: this.h * scale,
			x: screenPos.x - this.centerX*scale,
			y: screenPos.y - this.centerY*scale,
		};
	},

	getRelativeCursor: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
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

	isInsideScreenRect: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
		var p = this.getRelativeCursor(x,y,pos);
		if (0 <= p.x && p.x <= rect.w &&
			0 <= p.y && p.y <= rect.h) {
			return true;
		}
		return false;
	},

	isOverRotationHandle: function(x,y,pos) {
		var rect = this.getScreenRect(pos);
		var p = this.getRelativeCursor(x,y,pos);
		var dx = (rect.w/2) - p.x;
		var dy = 0 - p.y;
		var dist_sq = dx*dx+dy*dy;
		return dist_sq <= 64;
	},

	transform: function(ctx,pos) {
		var screenRect = this.getScreenRect(pos);
		ctx.translate(screenRect.x, screenRect.y);
		var scale = screenRect.w / this.w;
		ctx.scale(scale, scale);
	},
};
