
Ptero.scene_highscore = (function(){

	var backplate;
	var backplatePos;

	var backBtn;

	var wrenchBtn;
	var strongBtn;
	var scrollBtn;

	function cleanup() {

		wrenchBtn.disable();
		strongBtn.disable();
		scrollBtn.disable();

		backBtn.disable();
	}

	var time;
	function init() {
		time = 0;

		// backplate
		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		var screenW = Ptero.screen.getWidth();
		var scale = Ptero.screen.getScale();
		var startX = screenW/2 + w*scale/2;
		var midX = startX + (screenW - startX)/2;
		
		var hudFracX = midX / screenW;


		// side buttons
		wrenchBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_wrench'],
			hudPos: { x: hudFracX, y:0.2 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_options);
			},
		});
		wrenchBtn.enable();

		strongBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_strong'],
			hudPos: { x: hudFracX, y:0.5 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_highscore);
			},
		});
		strongBtn.enable();

		scrollBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_scroll'],
			hudPos: { x: hudFracX, y:0.8 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_credits);
			},
		});
		scrollBtn.enable();

		// back button
		backBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['btn_back'],
			hudPos: { x: 0.5, y:0.85 },
			isClickDelay: true,
			onclick: function() {
				Ptero.setScene(Ptero.scene_menu);
			},
		});
		backBtn.enable();

	}

	function update(dt) {
		time += dt;
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		ctx.fillStyle = "rgba(0,0,0,0.7)";
		backplate.fill(ctx, backplatePos);

		var alpha = 0.8;

		var backupAlpha = ctx.globalAlpha;
		ctx.globalAlpha = alpha;
		wrenchBtn.draw(ctx);

		ctx.globalAlpha = 1;
		strongBtn.draw(ctx);

		ctx.globalAlpha = alpha;
		scrollBtn.draw(ctx);

		ctx.globalAlpha = backupAlpha;

		backBtn.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		isVibrate: function() { return vibrate; },
	};

})();
