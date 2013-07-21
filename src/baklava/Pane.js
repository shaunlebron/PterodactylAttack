
Ptero.Baklava.Pane = function (w,h,axes,title) {
	// 2 axes labels (x,y,or z)
	this.axes = axes;

	// pixel dimensions of this pane
	this.pixelW = w;
	this.pixelH = h;
	this.aspect = w/h;

	this.title = title;
	this.nodeRadius = 4;
	var that = this;
	window.addEventListener("keydown", function(e) {
		if (e.keyCode == 18) {
			that.isZoomPanKey = true;
		}
	});
	window.addEventListener("keyup", function(e) {
		if (e.keyCode == 18) {
			that.isZoomPanKey = false;
		}
	});
};

Ptero.Baklava.Pane.prototype = {

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

		var apos = amin + arange/2;
		var bpos = bmin + brange/2;
		this.zoom(scale, apos, bpos);
	},

	// Zoom the window to the given scale.
	// Also, bring the point (apos,bpos) to the pixel (apixel, bpixel)
	zoom: function(scale, apos, bpos, apixel, bpixel) {

		this.apixel = (apixel==undefined) ? this.pixelW/2 : apixel;
		this.bpixel = (bpixel==undefined) ? this.pixelH/2 : bpixel;
	
		// Use the previously set center point if not specified.
		this.apos = (apos==undefined) ? this.apos : apos;
		this.bpos = (bpos==undefined) ? this.bpos : bpos;

		if (this.minScale) {
			this.scale = Math.max(this.minScale, scale);
		}
		else {
			this.scale = scale;
		}

		// Calculate the position of the topleft pixel.
		var aleft = this.apos - this.apixel / this.scale;
		var btop = this.bpos + this.bpixel / this.scale;

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
		var colors = {
			x:"#F00",
			y:"#00F",
		 	z:"#0F0",
		};

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

	drawBgLayer: function(ctx, i) {
		ctx.strokeStyle = (i == Ptero.Baklava.model.selectedLayer) ? "#F00" : "#333";
		ctx.lineWidth = 2;
		var frustum = Ptero.screen.getFrustum();

		var z = Ptero.background.layers[i].depth;
		var x = frustum.nearRight / frustum.near * z;
		var y = frustum.nearTop / frustum.near * z;

		var bl = {
			x: -x,
			y: -y,
			z: z,
		};
		var br = {
			x: x,
			y: -y,
			z: z,
		};
		var tl = {
			x: -x,
			y: y,
			z: z,
		};

		this.line(ctx, bl, br);
		this.line(ctx, bl, tl);
	},

	drawFrustum: function(ctx) {
		ctx.strokeStyle = "#BBB";
		ctx.lineWidth = 1;
		if (this.frustum) {
			var i,len,edges=this.frustum.edges;
			for (i=0,len=edges.length; i<len; i++) {
				this.lines(ctx, edges[i]);
			}
		}
	},

	/* INPUT FUNCTIONS */

	// select the path node within a radius of the given selection point

	setFocusPoint: function(x,y) {
		var pos = this.screenToSpace(x,y);
		this.apos = pos[this.axes[0]];
		this.bpos = pos[this.axes[1]];
	},

	getLayerAtPos: function(x,y) {
		var i,len=Ptero.background.layers.length;
		for (i=0; i<len; i++) {
			var screenPos = this.spaceToScreen({x:0,y:0,z:Ptero.background.layers[i].depth});
			if (this.axes[0] == 'z') {
				if (Math.abs(screenPos.x - x) < this.nodeRadius) {
					return i;
				}
			}
			else if (this.axes[1] == 'z') {
				if (Math.abs(screenPos.y - y) < this.nodeRadius) {
					return i;
				}
			}
		}
		return null;
	},

	getNodeInfoFromCursor: function(x,y) {
		var mode = Ptero.Baklava.model.mode;

		var i = this.getLayerAtPos(x,y);
		if (i != null) {
			var z = this.screenToSpace(x,y).z;
			return {
				layerIndex: i,
				offset_z: Ptero.background.layers[i].depth - z,
			};
		}
		else {
			return {};
		}
	},

	selectNode: function(info) {
		this.hoverSelect = false;
		if (info.layerIndex != null) {
			Ptero.Baklava.model.selectLayer(info.layerIndex);
			this.updateEnemyPos();
			this.selectedOffsetZ = info.offset_z;
		}
		else {
			this.hoverSelect = true;
			Ptero.Baklava.model.selectLayer(null);
		}
	},

	updateNodePosition: function(x,y) {
		var layer = Ptero.Baklava.model.selectedLayer;
		if (layer != null) {
			var z = this.screenToSpace(x,y).z;
			Ptero.background.layers[layer].depth = z + this.selectedOffsetZ;
			this.updateEnemyPos();
		}
	},
	updateEnemyPos: function() {
		var layer = Ptero.background.layers[Ptero.Baklava.model.selectedLayer];
		if (layer) {
			var point = Ptero.Baklava.model.enemyPos;
			point.x = point.x / point.z * layer.depth;
			point.y = point.y / point.z * layer.depth;
			point.z = layer.depth - 0.001;
		}
	},

	mouseStart: function(x,y) {
		if (this.isZoomPanKey) {
			this.isPanning = true;
			this.setFocusPoint(x,y);
		}
		else {
			var info = this.getNodeInfoFromCursor(x,y);
			this.selectNode(info);
		}
	},
	mouseMove: function(x,y) {
		if (this.isPanning) {
			this.zoom(this.scale, this.apos, this.bpos, x, y);
		}
		else {
			if (this.hoverSelect) {
				var info = this.getNodeInfoFromCursor(x,y);
				Ptero.Baklava.model.selectLayer(info.layerIndex);
				this.selectedOffsetZ = info.offset_z;
			}
			this.updateNodePosition(x,y);
		}
	},
	mouseEnd: function(x,y) {
		this.isPanning = false;
		this.hoverSelect = false;
	},
	mouseScroll: function(x,y,delta,deltaX,deltaY) {
		if (this.isZoomPanKey) {
			this.setFocusPoint(x,y);

			// from: http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
			var scale = Math.pow(1 + Math.abs(deltaY)/4 , deltaY > 0 ? 1 : -1);

			this.scale *= scale;
			this.zoom(this.scale, this.apos, this.bpos, x, y);
		}
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		//ctx.fillStyle = "#ffeaba";
		ctx.fillStyle = "#fff4db";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);
		this.drawFrustum(ctx);
		this.drawAxes(ctx);

		var i,len=Ptero.background.layers.length;
		for (i=0; i<len; i++) {
			this.drawBgLayer(ctx, i);
		}

		var mode = Ptero.Baklava.model.mode;

		if (this.axes[0] == 'x' && this.axes[1] == 'z') {
			var p = Ptero.painter;
			var f = Ptero.screen.getFrustum();
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.beginPath();
			this.moveTo(ctx, { x: f.nearLeft, y: f.nearTop, z: f.near });
			this.lineTo(ctx, { x: f.nearLeftA, y: f.nearTop, z: f.near });
			this.lineTo(ctx, { x: f.farLeftA, y: f.farTop, z: f.far });
			this.lineTo(ctx, { x: f.farLeft, y: f.farTop, z: f.far });
			ctx.closePath();
			ctx.fill();
			ctx.beginPath();
			this.moveTo(ctx, { x: f.nearRight, y: f.nearTop, z: f.near });
			this.lineTo(ctx, { x: f.nearRightA, y: f.nearTop, z: f.near });
			this.lineTo(ctx, { x: f.farRightA, y: f.farTop, z: f.far });
			this.lineTo(ctx, { x: f.farRight, y: f.farTop, z: f.far });
			ctx.closePath();
			ctx.fill();
		}
	},
	update: function(dt) {
	},
};
