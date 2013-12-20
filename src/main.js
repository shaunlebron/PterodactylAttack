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

	Ptero.assets.loadAfterPreload({
		preloadImageNames: [
			'bg_menu',
			'cliff',
			'logo',
		],
		onPreload: function() {
			console.log('starting title scene');
			Ptero.setScene(Ptero.scene_title);
			Ptero.executive.start();
		},
		onLoad: function() {
			console.log('loading settings');
			Ptero.settings.load();
			console.log('creating backgrounds');
			Ptero.createBackgrounds();
			console.log("initing input");
			Ptero.input.init();
			console.log("animating title scene out");
			Ptero.scene_title.animateOut();

			// open socket for remote control
			/*
			Ptero.socket = io.connect('/');
			Ptero.socket.on('clientlog', function(data) {
				console.log(data.msg);
				Ptero.socket.emit('serverlog', { msg: 'hello from client'} );
			});
			Ptero.socket.on('shoot', function(data) {
				//console.log('shoot:',data);
				if (Ptero.orb.isTouchEnabled()) {
					Ptero.orb.shoot(data);
				}
			});
			Ptero.socket.on('net', function(on) {
				//console.log('net',on);
				if (Ptero.scene_play.isNetBtnEnabled()) {
					Ptero.orb.engageNet(on);
				}
			});
			*/
		},
	});
};
