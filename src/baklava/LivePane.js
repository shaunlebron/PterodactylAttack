
Ptero.Baklava.LivePane = function() {
	this.scene = Ptero.Baklava.scene_parallax;

	this.hudScale = Ptero.screen.getWindowHeight() / (Ptero.Baklava.screen.getPaneHeight()*2);
	this.nodeRadius = 4 * this.hudScale;
};

Ptero.Baklava.LivePane.prototype = {

	/* COORDINATE FUNCTIONS */

	windowToSpace: function(x,y,spaceZ) {
		var frustum = Ptero.frustum;
		var spacePos = Ptero.screen.windowToSpace({x:x,y:y});
		spacePos = frustum.projectToZ(spacePos, spaceZ);
		return {
			x: spacePos.x,
			y: spacePos.y,
			z: spaceZ,
		};
	},

	spaceToWindow: function(pos) {
		return Ptero.screen.spaceToWindow(pos);
	},

	screenToAngle: function(x,y,cx,cy) {
		x -= cx;
		y -= cy;
		var dist = Math.sqrt(x*x+y*y);
		y /= dist;
		y = -y;
		var a = Math.acos(y);
		if (x <= 0) {
			a = -a;
		}
		return a;
	},

	/* INPUT FUNCTIONS */

	getNodeInfoFromCursor: function(x,y) {

		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "position") {
			var layer = Ptero.background.getLayerFromPixel(x,y);
			if (layer == Ptero.Baklava.model.selectedLayer) {
				Ptero.Baklava.model.selectLayer(null);
			}
			else {
				Ptero.Baklava.model.selectLayer(layer);
				this.updateEnemyPos(x,y);
			}
		}
		else if (mode == "collision") {

			// select a layer if one is not already selected
			if (Ptero.Baklava.model.selectedLayer == null) {
				var layer = Ptero.background.getLayerFromPixel(x,y);
				Ptero.Baklava.model.selectLayer(layer);
			}

			var collisionMode = model.collisionMode;
			var collisionDraft = model.collisionDraft;
			var near = Ptero.frustum.near;

			// WHEN CREATING, WE ARE SIMPLY ADDING POINTS WITH EACH CLICK, AND STOPPING WHEN FIRST POINT IS CLICKED
			if (collisionMode == "create") {
				var len = collisionDraft.points.length;
				if (len > 0) {
					var screenPos0 = this.spaceToWindow(collisionDraft.points[0]);
					var dx = x - screenPos0.x;
					var dy = y - screenPos0.y;
					var dist_sq = dx*dx+dy*dy;
					if (dist_sq < 100) {
						// finalize shape into current layer
						collisionDraft.isComplete = true;
						Ptero.background.addLayerCollisionShape(collisionDraft);
						model.setCollisionMode("select");
						return {};
					}
				}

				var pos = this.windowToSpace(x,y,near);
				collisionDraft.points.push(pos);
				return {
					point: collisionDraft.points[len],
					offset_x: 0,
					offset_y: 0,
				};
			}

			// WHEN SELECTING, WE EITHER SELECT A SHAPE VERTEX OR ITS INSIDE REGION
			else if (collisionMode == "select") {
				var shapes = Ptero.background.getLayerCollisionShapes();
				if (shapes) {
					var i,numShapes=shapes.length;

					// See if we have clicked on any points
					for (i=0; i<numShapes; i++) {
						var shape = shapes[i];
						var j,numPoints = shape.points.length;
						for (j=0; j<numPoints; j++) {
							var point = shape.points[j];
							var screenPos = this.spaceToWindow(point);
							var dx = x - screenPos.x;
							var dy = y - screenPos.y;
							var dist_sq = dx*dx+dy*dy;
							if (dist_sq < 100) {
								var spaceClick = this.windowToSpace(x,y,point.z);
								return {
									shape: shape,
									point: point,
									pointIndex: j,
									offset_x: point.x - spaceClick.x,
									offset_y: point.y - spaceClick.y,
								};
							}
						}
					}

					// See if we have clicked on any shapes
					for (i=0; i<numShapes; i++) {
						var shape = shapes[i];
						var points = shape.points;
						var spaceClick = this.windowToSpace(x,y,points[0].z);

						if (shape.isPointInside(spaceClick.x, spaceClick.y)) {

							// Compute the offset from each vertex in the shape to the point of click.
							var offsets = [];
							var j,numPoints = points.length;
							for (j=0; j<numPoints; j++) {
								var point = points[j];
								offsets.push({
									x: point.x - spaceClick.x,
									y: point.y - spaceClick.y,
								});
							}

							return {
								shape: shape,
								offsets: offsets,
							};
						}
					}
				}
			}
			else if (collisionMode == "insert") {
				var i = this.selectedPointIndex;
				var points = this.selectedShape.points;
				var j, numPoints = points.length;
				var point0 = points[i];
				var point1 = this.windowToSpace(x,y,point0.z);
				var point2 = points[i==0 ? numPoints-1 : i-1];
				var point3 = points[(i+1)%numPoints];

				var v1 = new Ptero.Vector().set(point1).sub(point0).normalize();
				var v2 = new Ptero.Vector().set(point2).sub(point0).normalize();
				var v3 = new Ptero.Vector().set(point3).sub(point0).normalize();

				var a2 = v1.angleTo(v2);
				var a3 = v1.angleTo(v3);

				if (a2 < a3) {
					points.splice(i,0,point1);
				}
				else {
					i++;
					points.splice(i,0,point1);
				}

				Ptero.Baklava.model.setCollisionMode('select');
				return {
					shape: this.selectedShape,
					point: point1,
					pointIndex: i,
					offset_x: 0,
					offset_y: 0,
				};
			}

		}
		else if (mode == "parallax") {
			var offset = Ptero.background.getLayerParallaxOffset();
			var frustum = Ptero.frustum;
			var leftPos = { x: offset, y: 0, z: frustum.near };
			var rightPos = { x: -offset, y: 0, z: frustum.near };
			var leftScreenPos = this.spaceToWindow(leftPos);
			var rightScreenPos = this.spaceToWindow(rightPos);

			var spaceClick = this.windowToSpace(x,y,frustum.near);
			var leftScreenDx = leftScreenPos.x - x;
			var rightScreenDx = rightScreenPos.x - x;
			
			var minDx = 10;

			if (Math.abs(leftScreenDx) <= minDx) {
				return {
					parallax: true,
					offset_x: leftPos.x - spaceClick.x,
				};
			}
			else if (Math.abs(rightScreenDx) <= minDx) {
				return {
					parallax: true,
					offset_x: rightPos.x - spaceClick.x,
				};
			}
		}

		// Return an empty object if we cannot deduce a click selection.
		return {};
		
	},

	removeSelectedShape: function() {
		if (this.selectedShape) {
			Ptero.background.removeLayerCollisionShape(this.selectedShape);
		}
	},

	removeSelectedPoint: function() {
		if (this.selectedPoint) {
			if (this.selectedShape.points.length == 1) {
				this.removeSelectedShape();
			}
			else {
				// remove point
				this.selectedShape.points.splice(this.selectedPointIndex, 1);

				// select another point
				this.selectedPointIndex = Math.max(0, this.selectedPointIndex-1);
			}
		}
	},

	selectNode: function(info) {

		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "position") {
		}
		else if (mode == "collision") {
			if (info.point) {
				this.selectedPoint = info.point;
				this.selectedOffsetX = info.offset_x;
				this.selectedOffsetY = info.offset_y;
				this.selectedShape = info.shape;
				this.selectedPointIndex = info.pointIndex;
				console.log(this.selectedPointIndex);
			}
			else {
				this.selectedPoint = null;
				this.selectedShape = info.shape;
				this.selectedOffsets = info.offsets;
			}
		}
		else if (mode == "parallax") {
			this.selectedOffset = info.offset_x;
		}
	},

	updateEnemyPos: function(x,y) {
		var layer = Ptero.background.layers[Ptero.Baklava.model.selectedLayer];
		if (layer) {
			var point = Ptero.Baklava.model.enemyPos;
			point.z = layer.depth - 0.001;
			var spaceClick = this.windowToSpace(x,y,point.z);
			point.x = spaceClick.x;
			point.y = spaceClick.y;
		}
	},

	updateNodePosition: function(x,y) {
		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "position") {
			if (model.mode == "position") {
				this.updateEnemyPos(x,y);
			}
		}
		else if (mode == "collision") {
			if (this.selectedPoint != null) {
				var spaceClick = this.windowToSpace(x,y,this.selectedPoint.z);
				this.selectedPoint.x = spaceClick.x + this.selectedOffsetX;
				this.selectedPoint.y = spaceClick.y + this.selectedOffsetY;
				//Ptero.Baklava.loader.backup();
			}
			else if (this.selectedShape != null) {
				var shape = this.selectedShape;
				var spaceClick = this.windowToSpace(x,y,shape.points[0].z);
				var offsets = this.selectedOffsets;
				var i,len=offsets.length;
				for (i=0; i<len; i++) {
					shape.points[i].x = spaceClick.x + offsets[i].x;
					shape.points[i].y = spaceClick.y + offsets[i].y;
				}
				//Ptero.Baklava.loader.backup();
			}
		}
		else if (mode == "parallax") {
			if (this.selectedOffset != null) {
				var frustum = Ptero.frustum;
				var spaceClick = this.windowToSpace(x,y,frustum.near);
				var offset = Math.abs(spaceClick.x + this.selectedOffset);
				Ptero.background.setLayerParallaxOffset(offset);
				//Ptero.Baklava.loader.backup();
			}
		}
	},

	mouseStart: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
		var info = this.getNodeInfoFromCursor(x,y);
		this.selectNode(info);
	},

	mouseMove: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
		this.updateNodePosition(x,y);
	},

	mouseEnd: function(x,y) {
		var p = Ptero.screen.canvasToWindow(x,y);
		x = p.x;
		y = p.y;
	},

	/* PAINTER FUNCTIONS */

	transform: function(pos) {
		// for now, just assume the vector is a 3d space vector.
		return this.spaceToWindow(pos);
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
	createPath: function(ctx, points, closed) {
		var i,len=points.length;
		if (len == 0) {
			return;
		}
		ctx.beginPath();
		this.moveTo(ctx, points[0]);
		for (i=1; i<len; i++) {
			this.lineTo(ctx, points[i]);
		}
		if (closed) {
			ctx.closePath();
		}
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
		ctx.lineWidth = thickness * this.hudScale;
		ctx.strokeStyle = color;
		ctx.stroke();
	},

	/* DRAWING FUNCTIONS */

	drawCollisionShape: function(ctx, shape) {
		var points = shape.points;
		this.createPath(ctx, points, shape.isComplete);
		if (shape.isComplete) {
			if (shape == this.selectedShape && this.selectedPoint == null) {
				ctx.fillStyle = "rgba(0,0,255,0.2)";
			}
			else {
				ctx.fillStyle = "rgba(255,255,255,0.2)";
			}
			ctx.fill();
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 2 * this.hudScale;
			ctx.stroke();
		}
		else {
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 2 * this.hudScale;
			ctx.stroke();
		}
		var i,len = points.length;
		for (i=0; i<len; i++) {
			this.fillCircle(ctx, points[i], this.nodeRadius, points[i] == this.selectedPoint ? "#F00" : "#333");
		}
	},

	draw: function(ctx) {
		ctx.save();
		Ptero.screen.transformToWindow();
		this.scene.draw(ctx);

		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "collision") {
			var collisionMode = model.collisionMode;

			var shapes = Ptero.background.getLayerCollisionShapes();
			if (shapes) {
				var i,len=shapes.length;
				for (i=0; i<len; i++) {
					this.drawCollisionShape(ctx, shapes[i]);
				}
			}

			// Draw collision shape that is currently being drawn.
			if (collisionMode == "create") {
				this.drawCollisionShape(ctx, model.collisionDraft);
			}
		}
		else if (mode == "parallax") {
			var offset = Ptero.background.getLayerParallaxOffset();
			var frustum = Ptero.frustum;
			var painter = Ptero.painter;
			if (offset != null) {
				ctx.beginPath();
				painter.moveTo(ctx,{ x: 0, y: frustum.nearTop, z: frustum.near, });
				painter.lineTo(ctx,{ x: 0, y: frustum.nearBottom, z: frustum.near, });
				ctx.strokeStyle = "rgba(0,0,255,0.5)";
				ctx.lineWidth = 1 * this.hudScale;
				ctx.stroke();

				ctx.beginPath();
				painter.moveTo(ctx,{ x: offset, y: frustum.nearTop, z: frustum.near, });
				painter.lineTo(ctx,{ x: offset, y: frustum.nearBottom, z: frustum.near, });
				ctx.strokeStyle = "#00F";
				ctx.lineWidth = 2 * this.hudScale;
				ctx.stroke();

				ctx.beginPath();
				painter.moveTo(ctx,{ x: -offset, y: frustum.nearTop, z: frustum.near, });
				painter.lineTo(ctx,{ x: -offset, y: frustum.nearBottom, z: frustum.near, });
				ctx.strokeStyle = "#00F";
				ctx.lineWidth = 2 * this.hudScale;
				ctx.stroke();
			}
		}


		var p = Ptero.painter;
		var f = Ptero.frustum;
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.beginPath();
		p.moveTo(ctx, { x: f.nearLeft, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearLeftA, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearLeftA, y: f.nearBottom, z: f.near });
		p.lineTo(ctx, { x: f.nearLeft, y: f.nearBottom, z: f.near });
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		p.moveTo(ctx, { x: f.nearRight, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearRightA, y: f.nearTop, z: f.near });
		p.lineTo(ctx, { x: f.nearRightA, y: f.nearBottom, z: f.near });
		p.lineTo(ctx, { x: f.nearRight, y: f.nearBottom, z: f.near });
		ctx.closePath();
		ctx.fill();

		ctx.restore();
	
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},
};
