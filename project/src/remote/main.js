Ptero.Remote = Ptero.Remote || {};

window.onload = function() {

	// Create the canvas element.
	// (CocoonJS provides a more efficient screencanvas if you're using one main canvas).
	var canvas = document.createElement(
			navigator.isCocoonJS ? 'screencanvas' : 'canvas');

	// CocoonJS extended property for scaling canvas to a display:
	// (ScaleToFill, ScaleAspectFit, ScaleAspectFill)
	//canvas.idtkScale = 'ScaleAspectFit';
	//canvas.style.cssText=”idtkscale:ScaleAspectFit;”;
	// NOTE: commented out for now as it is not working

	var w,h;
	if (navigator.isCocoonJS) {
		w = window.innerWidth;
		h = window.innerHeight;
		// cap at 16:9 to prevent drawing the background outside anticipated boundaries
		if (w/h > 16/9) {
			w = h/9*16;
		}
		document.body.appendChild(canvas);
		//canvas.style.cssText="idtkscale:ScaleAspectFit;";
	}
	else {
		document.body.appendChild(canvas);

		w = 720;
		h = w/16*9;
		var body = document.getElementsByTagName("body")[0];

		function center() {
			var screenW = document.body.clientWidth;
			var screenH = document.body.clientHeight;
			canvas.style.position = "relative";
			x = Math.max(0,(screenW/2 - w/2));
			y = Math.max(0,(screenH/2 - h/2));
			canvas.style.left = x+"px";
			canvas.style.top = y+"px";
			body.style.backgroundPosition = (x-132)+"px " + (y-35)+"px";
		}
		center();
		window.addEventListener("resize", center,false);
	}

	console.log("initing screen");
	Ptero.screen.init(canvas,w,h);

	Ptero.Remote.assets.load(function() {
		console.log("initing input");
		Ptero.input.init();

		console.log('initing socket');
		//Ptero.socket = io.connect('/');
		Ptero.socket = io.connect('http://192.168.1.103:3001');
		Ptero.socket.on('clientlog', function(data) {
			console.log(data.msg);
			Ptero.socket.emit('serverlog', { msg: 'hello from client'} );
		});

		console.log('starting scene');
		Ptero.setScene(Ptero.Remote.scene_remote);
		Ptero.executive.start();
	});
};
