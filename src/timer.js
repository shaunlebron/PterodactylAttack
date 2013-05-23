
Ptero.TimerDisplay = function(seconds) {
	this.timer = new Ptero.Timer(seconds*1000);
	this.timerFont = Ptero.assets.mosaics["timer"];

	this.updateText();
};

function zeroPad(numDigits,number) {
	var result = (""+number);
	var len = result.length;
	var i;
	for (i=len; i<numDigits; i++) {
		result = "0" + result;
	}
	return result;
}
	
Ptero.TimerDisplay.prototype = {
	updateText: function() {
		var t = this.timer.getMillisLeft()/1000;
		this.text = zeroPad(2,Math.ceil(t));
	},
	update: function(dt) {
		this.timer.increment(dt*1000);
		this.updateText();
	},
	isDone: function() {
		return this.timer.isDone();
	},
	draw: function(ctx) {

		var i,len=this.text.length;
		var totalW = 0;
		var scale = Ptero.background.getScale();
		for (i=0; i<len; i++) {
			var c = this.text[i];
			totalW += this.timerFont.frames[c].origSize.width * scale;
		}

		var x = Ptero.screen.getWidth()/2 - totalW/2;
		var y = 0;
		for (i=0; i<len; i++) {
			var c = this.text[i];
			var w = this.timerFont.frames[c].origSize.width * scale;
			var h = this.timerFont.frames[c].origSize.height * scale;
			var pos = Ptero.screen.screenToSpace({ x: x+w/2, y: y+h/2 });
			this.timerFont.draw(ctx, pos, c);
			x += w;
		}
	},
};
