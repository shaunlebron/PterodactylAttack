
Ptero.Crater.Pane = function (w,h,axes,title) {
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
		if (e.keyCode == 16) {
			that.isDragTogether = true;
		}
	});
	window.addEventListener("keyup", function(e) {
		if (e.keyCode == 16) {
			that.isDragTogether = false;
		}
	});
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

		this.scale = scale;

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
		ctx.strokeStyle = "#BBB";
		ctx.lineWidth = 1;
		if (this.frustum) {
			var i,len,edges=this.frustum.edges;
			for (i=0,len=edges.length; i<len; i++) {
				this.lines(ctx, edges[i]);
			}
		}
	},

	drawModelPath: function(ctx, model) {
		var interp = model.interp;
		var totalTime = interp.totalTime;
		var numPoints = 70;
		var step = totalTime/numPoints;

		var pos;
		ctx.beginPath();
		for (t=0; t<=totalTime-step; t+=1.4*step) {
			pos = interp(t);
			if (pos) {
				this.moveTo(ctx, pos);
			}
			pos = interp(t+step);
			if (pos) {
			this.lineTo(ctx, pos);
			}
		}
		ctx.strokeStyle = "#777";
		ctx.lineWidth = 2;
		ctx.stroke();
	},

	drawModelNodes: function(ctx, model) {
		var isActive = (model == Ptero.Crater.enemy_model);

		if (isActive) {
			// Only draw nodes for active path
			var nodes = model.points;
			var i,len = nodes.length;
			var selectedIndex = model.selectedIndex;
			for (i=0; i<len; i++) {
				if (selectedIndex != i) {
					this.fillCircle(ctx, nodes[i], this.nodeRadius, "#555",2);
				}
			}

			// highlight selected point
			var selectedPoint = model.getSelectedPoint();
			if (selectedPoint) {
				this.fillCircle(ctx, selectedPoint, this.nodeRadius, "#F00",2);
			}

			// draw replay point
			else {
				var pos = model.enemy.getPosition();
				if (pos) {
					this.fillCircle(ctx, pos, this.nodeRadius, "#00F",2);
				}
			}
		}
		else {
			// when not active path, just display the current position
			var pos = model.enemy.getPosition();
			if (pos) {
				if (model.enemy.path.isDone()) {
					console.log(model.enemy.path.time, model.enemy.path.totalTime, model.enemy.path.pos);
				}
				this.fillCircle(ctx, pos, this.nodeRadius, "#555",2);
			}
		}
	},

	/* INPUT FUNCTIONS */

	// select the path node within a radius of the given selection point
	getNodeInfoFromCursor: function(x,y) {
		var min_dist_sq = 100;
		var nodes = Ptero.Crater.enemy_model.points;
		var i,len = nodes.length;

		var node,pos;
		var dx,dy,dist_sq;
		var closest_index;
		var offset_x, offset_y;

		for (i=0; i<len; i++) {
			node = nodes[i];
			pos = this.spaceToScreen(node);
			dx = pos.x - x;
			dy = pos.y - y;
			dist_sq = dx*dx + dy*dy;
			if (dist_sq < min_dist_sq) {
				closest_index = i;
				min_dist_sq = dist_sq;
				offset_x = dx;
				offset_y = dy;
			}
		}

		return {
			index: closest_index,
			offset_x: offset_x,
			offset_y: offset_y,
		};
	},

	selectNode: function(index,offset_x,offset_y) {
		Ptero.Crater.enemy_model.selectPoint(index);
		this.selectedOffsetX = offset_x;
		this.selectedOffsetY = offset_y;
	},

	updateNodePosition: function(x,y) {
		var point = Ptero.Crater.enemy_model.getSelectedPoint();
		if (point) {
			var pos = this.screenToSpace(
				x + this.selectedOffsetX,
				y + this.selectedOffsetY
			);
			var a = this.axes[0];
			var b = this.axes[1];
			point[a] = pos[a];
			point[b] = pos[b];

			// prevent z from going behind camera (causes some errors i haven't accounted for yet)
			point.z = Math.max(0.0001, point.z);
			Ptero.Crater.enemy_model.refreshPath();
		}
	},

	setFocusPoint: function(x,y) {
		var pos = this.screenToSpace(x,y);
		this.apos = pos[this.axes[0]];
		this.bpos = pos[this.axes[1]];
	},

	mouseStart: function(x,y) {
		var i = this.getNodeInfoFromCursor(x,y);
		this.selectNode(i.index, i.offset_x, i.offset_y);
		this.isPanning = (i.index == undefined && this.isDragTogether);
		if (this.isPanning) {
			this.setFocusPoint(x,y);
		}
	},
	mouseMove: function(x,y) {
		this.updateNodePosition(x,y);
		if (this.isPanning) {
			this.zoom(this.scale, this.apos, this.bpos, x, y);
		}
	},
	mouseEnd: function(x,y) {
		this.isPanning = false;
	},
	mouseScroll: function(x,y,delta,deltaX,deltaY) {
		this.setFocusPoint(x,y);

		// from: http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
		var scale = Math.pow(1 + Math.abs(deltaY)/4 , deltaY > 0 ? 1 : -1);

		this.scale *= scale;
		this.zoom(this.scale, this.apos, this.bpos, x, y);
	},

	/* MAIN FUNCTIONS */

	draw: function(ctx) {
		ctx.fillStyle = "#EEE";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);
		this.drawFrustum(ctx);
		this.drawAxes(ctx);

		var models = Ptero.Crater.enemy_model_list.models;
		var i,len=models.length;
		var e;
		if (len > 1) {
			ctx.globalAlpha = 0.35;
			for (i=0; i<len; i++) {
				var e = models[i];
				if (e != Ptero.Crater.enemy_model && e.visible) {
					this.drawModelPath(ctx, e);
					this.drawModelNodes(ctx, e);
				}
			}
			ctx.globalAlpha = 1;
		}
		e = Ptero.Crater.enemy_model;
		this.drawModelPath(ctx, e);
		this.drawModelNodes(ctx, e);
	},
	update: function(dt) {
	},
};
