
Ptero.Crater.Pane = function (w,h,axes) {
	// 2 axes labels (x,y,or z)
	this.axes = axes;

	// pixel dimensions of this pane
	this.pixelW = w;
	this.pixelH = h;
	this.aspect = w/h;
};

Ptero.Crater.Pane.prototype = {

	/* WINDOW FUNCTIONS */

	// Scale the window to fit the given rectangle.
	fitWindow: function(amin,amax,bmin,bmax) {
		var a = this.axes[0];
		var b = this.axes[1];

		var arange = amax - amin;
		var brange = bmax - bmin;
		var windowAspect = arange / brange;

		var scale;
		if (windowAspect > this.aspect) {
			scale = this.pixelW / arange;
		}
		else {
			scale = this.pixelH / brange;
		}

		var amid = amin + arange/2;
		var bmid = bmin + brange/2;
		this.zoom(scale, amid,bmid);
	},

	// Zoom the window to the given scale at the given center point.
	zoom: function(scale, amid,bmid) {
	
		// Use the previously set center point if not specified.
		this.amid = (amid==undefined) ? this.amid : amid;
		this.bmid = (bmid==undefined) ? this.bmid : bmid;

		this.scale = scale;

		// Calculate the position of the topleft pixel.
		var aleft = this.amid - this.pixelW / this.scale / 2;
		var btop = this.bmid + this.pixelH / this.scale / 2;

		// Set pixel offset of the origin from the topleft pixel.
		this.origin = {
			x: -aleft * this.scale,
			y: btop * this.scale,
		};
	},

	// Set window range to be a padded box around frustum.
	fitFrustum: function(frustum, scale) {
		this.frustum = frustum;
		var a = this.axes[0];
		var b = this.axes[1];

		var pad = 0.08;
		var apad = frustum[a+'range']*pad;
		var amin = frustum[a+'min']-apad;
		var amax = frustum[a+'max']+apad;
		var bpad = frustum[b+'range']*pad;
		var bmin = frustum[b+'min']-bpad;
		var bmax = frustum[b+'max']+bpad;

		this.fitWindow(amin,amax,bmin,bmax);
	},

	/* COORDINATE FUNCTIONS */

	screenToSpace: function(x,y) {
		var a = (x - this.origin.x) / this.scale;
		var b = -(y - this.origin.y) / this.scale;
		return { a:a, b:b, };
	},
	_spaceToScreen: function(a,b) {
		var x = a * this.scale + this.origin.x;
		var y = -b * this.scale + this.origin.y;
		return { x:x, y:y, };
	},
	spaceToScreen: function(spacePos) {
		var a = spacePos[this.axes[0]];
		var b = spacePos[this.axes[1]];
		return this._spaceToScreen(a,b);
	},

	/* PAINTER FUNCTIONS */

	transform: function(pos) {
		// for now, just assume the vector is a 3d space vector.
		return this.spaceToScreen(pos);
	},
	moveTo: function(ctx,pos) {
		var p = this.transform(pos);
		ctx.moveTo(p.x,p.y);
	},
	lineTo: function(ctx,pos) {
		var p = this.transform(pos);
		ctx.lineTo(p.x,p.y);
	},
	line: function(ctx, p1, p2) {
		ctx.beginPath();
		this.moveTo(ctx, p1);
		this.lineTo(ctx, p2);
		ctx.stroke();
	},
	lines: function(ctx, points) {
		var i,len;
		ctx.beginPath();
		this.moveTo(ctx, points[0]);
		for (i=1,len=points.length; i<len; i++) {
			this.lineTo(ctx, points[i]);
		}
		ctx.closePath();
		ctx.stroke();
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		ctx.fillStyle = "#EEE";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);
		ctx.strokeStyle = "#555";
		ctx.lineWidth = 1;
		if (this.frustum) {
			var i,len,edges=this.frustum.edges;
			for (i=0,len=edges.length; i<len; i++) {
				this.lines(ctx, edges[i]);
			}
		}
	},
	update: function(dt) {
	},
};
