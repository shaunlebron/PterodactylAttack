
Ptero.Crater.RotationPane = function(w,h){
	this.pixelW = w;
	this.pixelH = h;
	this.pad = 10;
	this.radius = this.pixelH/2 - this.pad;
	this.nodeRadius = 4;
};

Ptero.Crater.RotationPane.prototype = {

	getPosition: function() {
		var x = this.pixelW/2;
		var y = this.pixelH/2;
		return { x:x,y:y };
	},
	getAngleOffset: function(angle) {
		angle = angle || 0;
		angle -= Math.PI/2;
		var s = Math.sin(angle);
		var c = Math.cos(angle);
		return {
			x: this.radius * c,
			y: this.radius * s,
		};
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

	// select the path node within a radius of the given selection point
	getNodeInfoFromCursor: function(x,y) {
		var min_dist_sq = 100;
		var nodes = Ptero.Crater.enemy_model.points;
		var i,len = nodes.length;

		var node,pos,offset;
		var dx,dy,dist_sq;
		var closest_index;
		var offset_x, offset_y;

		var click_angle, offset_angle;

		var i = Ptero.Crater.enemy_model.selectedIndex;
		node = Ptero.Crater.enemy_model.getSelectedPoint();
		if (node) {
			pos = this.getPosition();
			offset = this.getAngleOffset(node.angle);
			dx = pos.x + offset.x - x;
			dy = pos.y + offset.y - y;
			dist_sq = dx*dx + dy*dy;
			if (dist_sq < min_dist_sq) {
				closest_index = i;
				min_dist_sq = dist_sq;
				offset_x = dx;
				offset_y = dy;

				click_angle = this.screenToAngle(x,y,pos.x,pos.y);
				offset_angle = node.angle - click_angle;
			}
		}

		return {
			index: closest_index,
			offset_angle: offset_angle,
		};
	},
	updateNodePosition: function(x,y) {
		var enemy_model = Ptero.Crater.enemy_model;
		var point = enemy_model.getSelectedPoint();
		if (point) {
			if (this.selectedOffsetAngle != undefined) {
				// rotate
				var i = enemy_model.selectedIndex;
				var pos = this.getPosition();
				var click_angle = this.screenToAngle(x,y,pos.x,pos.y);
				point.angle = click_angle + this.selectedOffsetAngle;
			}
			Ptero.Crater.enemy_model.refreshPath();
			this.movedAngle = true;
		}
	},
	mouseStart: function(x,y) {
		var i = this.getNodeInfoFromCursor(x,y);
		Ptero.Crater.enemy_model.selectPoint(i.index);
		this.selectedOffsetAngle = i.offset_angle;
		if (i.index == null) {
			this.startAngle = null;
		}
		else {
			var point = Ptero.Crater.enemy_model.getSelectedPoint();
			this.startAngle = point.angle;
			this.movedAngle = false;
		}
	},
	mouseMove: function(x,y) {
		this.updateNodePosition(x,y);
	},
	mouseEnd: function(x,y) {
		if (this.startAngle != null && this.movedAngle) {
			var model = Ptero.Crater.enemy_model;
			var point = model.getSelectedPoint();
			var prevAngle = this.startAngle;
			var curAngle = point.angle;
			Ptero.Crater.enemy_model_list.recordForUndo({
				model: model,
				undo: function() {
					point.angle = prevAngle;
					model.refreshPath();
				},
				redo: function() {
					point.angle = curAngle;
					model.refreshPath();
				},
			});
		}
	},
	drawNode: function(ctx,point) {

		// get center of circle
		var pos = this.getPosition();
		var x = pos.x;
		var y = pos.y;

		if (!point) {
			// draw light perimeter
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(x,y,this.radius,0,2*Math.PI);
			ctx.strokeStyle = "#555";
			ctx.stroke();
			return;
		}

		// determine the start and end angles for the angle region
		var startAngle, endAngle;
		if (point.angle < 0) {
			startAngle = point.angle-Math.PI/2;
			endAngle = -Math.PI/2;
		}
		else {
			startAngle = -Math.PI/2;
			endAngle = point.angle-Math.PI/2;
		}

		var isSelected = point == Ptero.Crater.enemy_model.getSelectedPoint();

		// draw the angle region
		ctx.beginPath();
		ctx.arc(x,y,this.radius,startAngle,endAngle);
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = ctx.fillStyle = isSelected ? "#FAA" : "#AAF";
		ctx.fill();
		ctx.stroke();

		// draw light perimeter
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x,y,this.radius,0,2*Math.PI);
		ctx.strokeStyle = "#555";
		ctx.stroke();

		// draw dark perimeter around region
		ctx.beginPath();
		ctx.arc(x,y,this.radius,startAngle,endAngle);
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 2;
		//ctx.stroke();

		// draw angle node
		var rpos = this.getAngleOffset(point.angle);
		ctx.beginPath();
		ctx.arc(x+rpos.x, y+rpos.y, this.nodeRadius, 0, Math.PI*2);
		ctx.fillStyle = isSelected ? "#F00" : "#00F";
		ctx.fill();

		// draw degree label
		ctx.font = (this.radius*0.5)+"px sans-serif";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var degrees = Math.floor(point.angle*180/Math.PI);
		var text = degrees+"\u00B0";
		var tx = x, ty = y;
		if (point.angle < 0) {
			tx -= ctx.measureText("-").width;
			tx += ctx.measureText("\u00B0").width;
		}
		else {
			// I have no idea why I have to divide the width by 2 here.
			tx += ctx.measureText("\u00B0").width/2;
		}
		ctx.fillStyle = "#333";
		ctx.fillText(text,tx,ty);
	},
	draw: function(ctx) {
		ctx.fillStyle = "#EEE";
		ctx.fillRect(0,0,this.pixelW,this.pixelH);

		var e = Ptero.Crater.enemy_model;
		var point = e.getSelectedPoint();
		if (point) {
			this.drawNode(ctx,point);
		}
		else {
			point = Ptero.Crater.enemy_model.enemy.getPosition();
			this.drawNode(ctx,point);
		}
	},
};
