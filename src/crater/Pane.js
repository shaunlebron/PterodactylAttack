
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

	fitWindow: function(amin,amax,bmin,bmax) {
		var a = this.axes[0];
		var b = this.axes[1];

		var arange = amax - amin;
		var brange = bmax - bmin;
		var amid = amin + arange/2;
		var bmid = bmin + brange/2;
		var windowAspect = arange / brange;

		var aleft,btop;
		if (windowAspect > this.aspect) {
			this.scale = this.pixelW / arange;
			aleft = amin;
			btop = bmid + this.pixelH / this.scale / 2;
		}
		else {
			this.scale = this.pixelH / brange;
			aleft = amid - this.pixelW / this.scale / 2;
			btop = bmax;
		}

		// get pixel offset of the origin from the top left corner
		this.origin = {
			x: -aleft * this.scale,
			y: btop * this.scale,
		};
	},
	fitFrustum: function(frustum) {
		this.frustum = frustum;
		var a = this.axes[0];
		var b = this.axes[1];

		// set range for our window view
		// (currently set to frustum bounds)
		var amin = frustum[a+'min'];
		var amax = frustum[a+'max'];
		var bmin = frustum[b+'min'];
		var bmax = frustum[b+'max'];

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
	spaceToScreen: function(vec) {
		var a = vec[this.axes[0]];
		var b = vec[this.axes[1]];
		return this._spaceToScreen(a,b);
	},

	/* PAINTER FUNCTIONS */

	transform: function(vec) {
		// for now, just assume the vector is a 3d space vector.
		return this.spaceToScreen(vec);
	},
	moveTo: function(ctx,vec) {
		var p = this.transform(vec);
		ctx.moveTo(p.x,p.y);
	},
	lineTo: function(ctx,p) {
		var p = this.transform(vec);
		ctx.lineTo(p.x,p.y);
	},
	line: function(ctx, p1, p2) {
		ctx.beginPath();
		this.moveTo(ctx, p1);
		this.lineTo(ctx, p2);
		ctx.stroke();
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		if (this.frustum) {
			var i,len,edges=frustum.edges;
			for (i=0,len=edges.length; i<len-1; i++) {
				this.line(ctx, edges[i], edges[i+1]);
			}
		}
	},
	update: function(dt) {
	},
};
