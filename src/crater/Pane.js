
Ptero.Crater.Pane = function (w,h,axes,title) {
	// 2 axes labels (x,y,or z)
	this.axes = axes;

	// pixel dimensions of this pane
	this.pixelW = w;
	this.pixelH = h;
	this.aspect = w/h;

	this.title = title;
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

		var pad = 0.3;
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
		var pos = {};
		pos[this.axes[0]] = a;
		pos[this.axes[1]] = b;
		return pos;
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
	fillCircle: function(ctx, spacePos, radius, color) {
		ctx.beginPath();
		var pos = this.transform(spacePos);
		ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
		ctx.fillStyle = color;
		ctx.fill();
	},
	strokeCircle: function(ctx, spacePos, radius, color, thickness) {
		ctx.beginPath();
		var pos = this.transform(spacePos);
		ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.stroke();
	},

	/* DRAWING FUNCTIONS */

	drawAxes: function(ctx) {
		var colors = {x:"#F00", y:"#00F", z:"#0F0"};

		var margin = 20;
		var x = margin;
		var y = this.pixelH - margin;
		
		var axisLen = 50;
		var arrowSize = 5;

		// draw horizontal axis
		ctx.beginPath();
		ctx.moveTo(x+1,y);
		ctx.lineTo(x+axisLen,y);
		ctx.fillStyle = ctx.strokeStyle = colors[this.axes[0]];
		ctx.stroke();

		// draw horizontal axis arrow
		ctx.beginPath();
		ctx.moveTo(x+axisLen,y);
		ctx.lineTo(x+axisLen-arrowSize,y-arrowSize);
		ctx.lineTo(x+axisLen-arrowSize,y+arrowSize);
		ctx.fill();

		// draw vertical axis
		ctx.beginPath();
		ctx.moveTo(x,y-1);
		ctx.lineTo(x,y-axisLen);
		ctx.fillStyle = ctx.strokeStyle = colors[this.axes[1]];
		ctx.stroke();

		// draw vertical axis arrow
		ctx.beginPath();
		ctx.moveTo(x,y-axisLen);
		ctx.lineTo(x-arrowSize,y-axisLen+arrowSize);
		ctx.lineTo(x+arrowSize,y-axisLen+arrowSize);
		ctx.fill();

		// draw horizontal axis label
		ctx.font = "italic 1em serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(this.axes[0],x+axisLen+arrowSize,y);

		// draw vertical axis label
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.fillText(this.axes[1],x,y-axisLen-arrowSize);

		// draw title
		ctx.textAlign = 'right';
		ctx.textBaseline = 'top';
		ctx.font = '1em serif';
		ctx.fillStyle = "#777";
		margin = 5;
		ctx.fillText(' '+this.title+' ', this.pixelW - margin, margin);
	},

	drawFrustum: function(ctx) {
		ctx.strokeStyle = "#555";
		ctx.lineWidth = 1;
		if (this.frustum) {
			var i,len,edges=this.frustum.edges;
			for (i=0,len=edges.length; i<len; i++) {
				this.lines(ctx, edges[i]);
			}
		}
	},

	drawEnemy: function(ctx) {
		this.strokeCircle(ctx, Ptero.Crater.enemy_points[0], 5, "#F00",2);
	},

	/* INPUT FUNCTIONS */

	getNodeFromPointer: function(x,y) {
		// select the path node within a radius of the given selection point
	},

	selectNode: function(node) {
		this.selectedNode = node;
		if (node) {
		}
		this.updateNodePosition(x,y);
	},

	mouseStart: function(x,y) {
		this.updateEnemyPosition(x,y);
		// TODO:get node selection
	},
	mouseMove: function(x,y) {
		this.updateEnemyPosition(x,y);
	},
	mouseEnd: function(x,y) {
	},

	updateEnemyPosition: function(x,y) {
		var pos = this.screenToSpace(x,y);
		var a = this.axes[0];
		var b = this.axes[1];
		var point = Ptero.Crater.enemy_points[0];
		point[a] = pos[a];
		point[b] = pos[b];

		// prevent z from going behind camera (causes some errors I haven't accounted for yet)
		point.z = Math.max(0.0001, point.z);
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		ctx.fillStyle = "#EEE";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);
		this.drawFrustum(ctx);
		this.drawAxes(ctx);
		this.drawEnemy(ctx);
	},
	update: function(dt) {
	},
};
