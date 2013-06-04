
Ptero.Baklava.LivePane = function() {
	this.scene = Ptero.Baklava.scene_parallax;
	this.nodeRadius = 4;
};

Ptero.Baklava.LivePane.prototype = {

	/* COORDINATE FUNCTIONS */

	screenToSpace: function(x,y,spaceZ) {
		var frustum = Ptero.screen.getFrustum();
		var spacePos = Ptero.screen.screenToSpace({x:x,y:y});
		spacePos = frustum.projectToZ(spacePos, spaceZ);
		return {
			x: spacePos.x,
			y: spacePos.y,
			z: spaceZ,
		};
	},

	spaceToScreen: function(pos) {
		return Ptero.screen.spaceToScreen(pos);
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

	getNodeSelectOffset: function(x,y) {
		var nodeSprite = Ptero.Baklava.model.enemySprite;
		var spaceCenter = Ptero.Baklava.model.enemyPos;
		var spaceClick = this.screenToSpace(x,y,spaceCenter.z);
		if (nodeSprite.getBillboard().isInsideScreenRect(x,y,spaceCenter)) {
			return {
				enemy: true,
				offset_x: spaceCenter.x - spaceClick.x,
				offset_y: spaceCenter.y - spaceClick.y,
			}
		}
	},

	getNodeInfoFromCursor: function(x,y) {

		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "position") {
			// If a knot is clicked, return the offset from that knot.
			if (node_offset = this.getNodeSelectOffset(x,y)) {
				return node_offset;
			}
		}
		else if (mode == "collision") {
			var collisionMode = model.collisionMode;
			var collisionDraft = model.collisionDraft;
			var near = Ptero.screen.getFrustum().near;

			// WHEN CREATING, WE ARE SIMPLY ADDING POINTS WITH EACH CLICK, AND STOPPING WHEN FIRST POINT IS CLICKED
			if (collisionMode == "create") {
				var len = collisionDraft.points.length;
				if (len > 0) {
					var screenPos0 = this.spaceToScreen(collisionDraft.points[0]);
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

				var pos = this.screenToSpace(x,y,near);
				collisionDraft.points.push(pos);
				return {
					point: collisionDraft.points[len],
					offset_x: 0,
					offset_y: 0,
				};
			}

			// WHEN SELECTING, WE EITHER SELECT A SHAPE VERTEX OR ITS INSIDE REGION
			else if (collisionMode == "select") {
				var shapes = Ptero.background.getCurrentLayerCollisionShapes();
				if (shapes) {
					var i,numShapes=shapes.length;

					// See if we have clicked on any points
					for (i=0; i<numShapes; i++) {
						var shape = shapes[i];
						var j,numPoints = shape.points.length;
						for (j=0; j<numPoints; j++) {
							var point = shape.points[j];
							var screenPos = this.spaceToScreen(point);
							var dx = x - screenPos.x;
							var dy = y - screenPos.y;
							var dist_sq = dx*dx+dy*dy;
							if (dist_sq < 100) {
								var spaceClick = this.screenToSpace(x,y,point.z);
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
						var spaceClick = this.screenToSpace(x,y,points[0].z);

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
				var point1 = this.screenToSpace(x,y,point0.z);
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
			if (info.enemy) {
				Ptero.Baklava.model.selectEnemy();
				this.selectedOffsetX = info.offset_x;
				this.selectedOffsetY = info.offset_y;
			}
			else {
				//Ptero.Baklava.model.selectLayer(null);
			}
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
		}
	},

	updateNodePosition: function(x,y) {
		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "position") {
			if (model.enemySelected && model.mode == "position") {
				var point = Ptero.Baklava.model.enemyPos;
				var spaceClick = this.screenToSpace(x,y,point.z);
				point.x = spaceClick.x + this.selectedOffsetX;
				point.y = spaceClick.y + this.selectedOffsetY;
			}
		}
		else if (mode == "collision") {
			if (this.selectedPoint != null) {
				var spaceClick = this.screenToSpace(x,y,this.selectedPoint.z);
				this.selectedPoint.x = spaceClick.x + this.selectedOffsetX;
				this.selectedPoint.y = spaceClick.y + this.selectedOffsetY;
				Ptero.Baklava.loader.backup();
			}
			else if (this.selectedShape != null) {
				var shape = this.selectedShape;
				var spaceClick = this.screenToSpace(x,y,shape.points[0].z);
				var offsets = this.selectedOffsets;
				var i,len=offsets.length;
				for (i=0; i<len; i++) {
					shape.points[i].x = spaceClick.x + offsets[i].x;
					shape.points[i].y = spaceClick.y + offsets[i].y;
				}
				Ptero.Baklava.loader.backup();
			}
		}
		else if (mode == "parallax") {
		}
	},

	mouseStart: function(x,y) {
		var info = this.getNodeInfoFromCursor(x,y);
		this.selectNode(info);
	},

	mouseMove: function(x,y) {
		this.updateNodePosition(x,y);
	},

	mouseEnd: function(x,y) {
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
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.stroke();
	},

	/* DRAWING FUNCTIONS */

	drawCollisionShape: function(ctx, shape) {
		var points = shape.points;
		this.createPath(ctx, points, shape.isComplete);
		if (shape.isComplete) {
			if (shape == this.selectedShape && this.selectedPoint == null) {
				ctx.fillStyle = "rgba(255,0,0,0.2)";
			}
			else {
				ctx.fillStyle = "rgba(255,255,255,0.2)";
			}
			ctx.fill();
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		else {
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		var i,len = points.length;
		for (i=0; i<len; i++) {
			this.fillCircle(ctx, points[i], this.nodeRadius, points[i] == this.selectedPoint ? "#F00" : "#333");
		}
	},

	draw: function(ctx) {
		this.scene.draw(ctx);

		var model = Ptero.Baklava.model;
		var mode = model.mode;
		if (mode == "collision") {
			var collisionMode = model.collisionMode;

			var shapes = Ptero.background.getCurrentLayerCollisionShapes();
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


		var p = Ptero.painter;
		var f = Ptero.screen.getFrustum();
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
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},
};
