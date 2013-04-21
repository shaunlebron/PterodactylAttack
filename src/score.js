
Ptero.score = (function(){

	var total = 0;

	var pointQueue = [
	];

	var pointDuration = 2.0;

	return {
		update: function(dt) {
			var i,len=pointQueue.length;

			// update times
			for (i=0;i<len;i++) {
				pointQueue[i].time += dt;
			}

			// expire times
			i=0;
			while (pointQueue[i]) {
				if (pointQueue[i].time > pointDuration) {
					pointQueue.splice(i,1);
				}
				else {
					i++;
				}
			}
		},
		draw: function(ctx) {
			var h = Ptero.screen.getHeight();
			var size = Math.floor(h/10);
			ctx.font = size + "px monospace";
			ctx.textAlign = "right";
			ctx.textBaseline = "top";
			ctx.fillStyle = "#FFF";
			var x = size*4;
			var y = 10;
			ctx.fillText(total,x,10);

			y += size*1.125;
			size = Math.floor(size*0.65);
			pad = size/8;
			ctx.font = size + "px monospace";
			ctx.fillStyle = "rgba(255,255,255,0.5)";
			var i,len=pointQueue.length;
			for (i=0; i<len; i++) {
				ctx.fillText("+"+pointQueue[i].value,x,y);
				y += size+pad;
			}
		},
		addPoints: function(value) {
			pointQueue.push({
				value: value,
				time: 0,
			});
			total += value;
		},
		setTotal: function(value) {
			total = value;
		},
	};
})();
