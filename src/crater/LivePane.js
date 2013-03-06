
Ptero.Crater.LivePane = function() {
	this.scene = Ptero.Crater.scene_crater;
};

Ptero.Crater.LivePane.prototype = {

	/* COORDINATE FUNCTIONS */

	screenToSpace: function(x,y) {
		var z = Ptero.Crater.enemy_model.getSelectedPoint().z;
		var frustum = Ptero.screen.getFrustum();
		var spacePos = Ptero.screen.screenToSpace({x:x,y:y});
		spacePos = frustum.projectToZ(spacePos, z);
		return {
			x: spacePos.x,
			y: spacePos.y,
		};
	},

	/* INPUT FUNCTIONS */

	getNodeInfoFromCursor: function(x,y) {
		var enemy = Ptero.Crater.enemy_model;
		var nodeSprite = enemy.getSelectedNodeSprite();
		if (nodeSprite) {
			var spaceCenter = enemy.getSelectedPoint();
			var spaceRect = nodeSprite.getBillboard().getSpaceRect(spaceCenter);
			var spaceClick = this.screenToSpace(x,y);
			if (spaceRect.x <= spaceClick.x && spaceClick.x <= spaceRect.x + spaceRect.w &&
				spaceRect.y <= spaceClick.y && spaceClick.y <= spaceRect.y + spaceRect.h) {
				return {
					offset_x: spaceCenter.x - spaceClick.x,
					offset_y: spaceCenter.y - spaceClick.y,
				}
			}
		}
		return null;
	},

	updateNodePosition: function(x,y) {
		var point = Ptero.Crater.enemy_model.getSelectedPoint();
		if (point) {
			var spaceClick = this.screenToSpace(x,y);
			point.x = spaceClick.x + this.selectedOffsetX;
			point.y = spaceClick.y + this.selectedOffsetY;
			Ptero.Crater.enemy_model.refreshPath();
		}
	},

	mouseStart: function(x,y) {
		var info = this.getNodeInfoFromCursor(x,y);
		if (info) {
			this.isDragging = true;
			this.selectedOffsetX = info.offset_x;
			this.selectedOffsetY = info.offset_y;
		}
		else {
			this.isDragging = false;
			Ptero.Crater.enemy_model.selectPoint(null);
		}
	},

	mouseMove: function(x,y) {
		if (this.isDragging) {
			this.updateNodePosition(x,y);
		}
	},

	mouseEnd: function(x,y) {
	},

	/* PAINTER FUNCTIONS */

/*
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
*/

	/* DRAWING FUNCTIONS */

/*
	drawPath: function(ctx) {
		var interp = Ptero.Crater.enemy_model.interp;
		var totalTime = interp.totalTime;
		var numPoints = 100;
		var step = totalTime/numPoints;

		ctx.beginPath();
		this.moveTo(ctx, interp(0));
		for (t=step; t<=totalTime; t+=step) {
			this.lineTo(ctx, interp(t));
		}
		ctx.strokeStyle = "#777";
		ctx.lineWidth = 2;
		ctx.stroke();
	},
*/

	draw: function(ctx) {
		this.scene.draw(ctx);
	},

	update: function(dt) {
		this.scene.update(dt);
	},

	init: function() {
		this.scene.init();
	},
};
