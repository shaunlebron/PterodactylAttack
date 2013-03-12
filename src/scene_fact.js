
Ptero.scene_fact = (function(){

	var facts = [

		'Pterosaurs ruled the skies for 155 million years.',
		'Pteros, birds, & bats evolved flight independently.',
		'Pteros ranged in size from sparrow to airplane.',
		'The largest pteros mostly glided around.',
		'Pteros had a wide range of head shapes.',
		'Ptero wings were supported by really long pinkies.',
		'Early Pterosaurs had long tails for balance.',
		'Ptero fossils were first discovered in 1784.',
		'Ptero wings were originally thought to be sea paddles.',
		'Paleontologists prefer the word "Pterosaur".',
		'One ptero fossil had a Spinosaur\'s broken tooth in it.',
		'Baby pteros are called "flaplings".',
		'Baby pteros could fly right after hatching.',
		'Pteros walked on all fours.',
		'Ptero extinction may have been caused by birds.',

		"Pteranodons attacked people in Jurassic Park III.",

	];

	var interp;
	var fact;
	var time;
	function init() {
		time = 0;
		fact = facts[Math.floor(Math.random()*facts.length)];
		interp = Ptero.makeInterp('linear', [0,1,1,0,0],[1.0,1.5,1.0,0.5]);
	}

	function update(dt) {
		if (time > interp.totalTime) {
			Ptero.fadeToScene(Ptero.scene_menu,1.0);
		}
		else {
			time += dt;
		}
	}

	function draw(ctx) {
		var w = Ptero.screen.getWidth();
		var h = Ptero.screen.getHeight();
		ctx.fillStyle = "#111";
		ctx.fillRect(0,0,w,h);
		ctx.font = "30px Arial";

		ctx.globalAlpha = interp(time);
		ctx.fillStyle = "#FFF";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText(fact, w/2,h/2);
		ctx.globalAlpha = 1.0;
	}
	
	return {
		init: init,
		update: update,
		draw: draw,
	};
})();
