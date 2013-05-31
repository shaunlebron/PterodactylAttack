
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

	// Determine if the given coord is inside the selection rectangle
	// of the given path knot index. Return an offset object if true.
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

		function getPointDistSq(x0,y0,x1,y1) {
			var dx,dy,dist_sq;
			dx = x0-x1;
			dy = y0-y1;
			return dx*dx + dy*dy;
		}

		// If a knot is clicked, return the offset from that knot.
		if (node_offset = this.getNodeSelectOffset(x,y)) {
			return node_offset;
		}

		// Return an empty object if we cannot deduce a click selection.
		return {};
		
	},

	selectNode: function(info) {
		if (info.enemy) {
			Ptero.Baklava.model.selectEnemy();
			this.selectedOffsetX = info.offset_x;
			this.selectedOffsetY = info.offset_y;
		}
		else {
			Ptero.Baklava.model.selectLayer(null);
		}
	},

	updateNodePosition: function(x,y) {
		if (Ptero.Baklava.model.enemySelected) {
			var point = Ptero.Baklava.model.enemyPos;
			var spaceClick = this.screenToSpace(x,y,point.z);
			point.x = spaceClick.x + this.selectedOffsetX;
			point.y = spaceClick.y + this.selectedOffsetY;
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

	drawModel: function(ctx, model) {
	},

	drawModelNodes: function(ctx, model) {
		var nodes = model.points;
		var i,len = nodes.length;
		var selectedIndex = model.selectedIndex;
		for (i=0; i<len; i++) {
			if (selectedIndex != i) {
				this.fillCircle(ctx, nodes[i], this.nodeRadius, "#555",2);
			}
		}
		var selectedPoint = model.getSelectedPoint();
		if (selectedPoint) {
			this.fillCircle(ctx, selectedPoint, this.nodeRadius, "#F00",2);
		}
		else {
			this.fillCircle(ctx, model.enemy.getPosition(), this.nodeRadius, "#00F",2);
		}
	},

	drawModelPath: function(ctx, model) {
		var interp = model.interp;
		var totalTime = interp.totalTime;
		var numPoints = 70;
		var step = totalTime/numPoints;

		ctx.beginPath();
		for (t=0; t<=totalTime-step; t+=1.4*step) {
			var pos = interp(t);
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

	draw: function(ctx) {
		this.scene.draw(ctx);

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
