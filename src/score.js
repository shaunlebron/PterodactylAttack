
Ptero.score = (function(){

	function zeroPad(numDigits,number) {
		var result = (""+number);
		var len = result.length;
		var i;
		for (i=len; i<numDigits; i++) {
			result = "0" + result;
		}
		return result;
	}

	var highScore;

	var total = 0;
	var pointQueue = [];
	var pointDuration = 2.0;

	return {
		resetHighScore: function() {
			highScore = 0;
			this.commitHighScore();
		},
		getHighScore: function() {
			return highScore;
		},
		commitHighScore: function() {
			localStorage.highScore = highScore;
		},
		loadHighScore: function() {
			highScore = null;
			try {
				highScore = JSON.parse(localStorage.highScore);
			}
			catch (e) {
			}
			if (!highScore) {
				this.resetHighScore();
			}
			console.log("highscore = " + highScore);
		},
		reset: function() {
			pointQueue.length = 0;
			total = 0;
		},
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
			var scoreFont = Ptero.assets.mosaics["scoretype"];

			var pad = Ptero.hud.getBorderPad();
			var y = pad;
			var x = Ptero.screen.getWidth() - pad;

			var text = zeroPad(7,total);
			var scale = Ptero.screen.getScale() * scoreFont.scale;

			var i,len=text.length;
			for (i=len-1; i>=0; i--) {
				var c = text[i];
				var w = scoreFont.frames[c].origSize.width * scale;
				var h = scoreFont.frames[c].origSize.height * scale;
				var pos = Ptero.screen.screenToSpace({ x: x-w/2, y: y+h/2 });
				scoreFont.draw(ctx, pos, c);
				x -= w;
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
		getTotal: function() {
			return total;
		},
	};
})();
