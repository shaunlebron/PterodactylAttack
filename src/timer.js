
Ptero.TimerDisplay = function(seconds) {
	this.timer = new Ptero.Timer(seconds*1000);

	this.button = new Ptero.TextButton({
		fitText: true,
		text: "00:00:00",
		textAlign: "right",
		textColor: "#FFF",
		font: "monospace",
		margin: 20,
		anchor: {x:"right", y:"top"},
	});
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
		var hundredths = Math.floor(t*100%100);
		var seconds = Math.floor(t%60);
		var minutes = Math.floor(t/60);
		this.button.text = (
			zeroPad(2,minutes) + ":" +
			zeroPad(2,seconds) + ":" +
			zeroPad(2,hundredths));
		if (t <= 10) {
			this.button.textColor = Math.floor(t) % 2 ? "#F00" : "#FFF";
		}
	},
	update: function(dt) {
		this.timer.increment(dt*1000);
		this.updateText();
	},
	isDone: function() {
		return this.timer.isDone();
	},
	draw: function(ctx) {
		this.button.draw(ctx);
	},
};
