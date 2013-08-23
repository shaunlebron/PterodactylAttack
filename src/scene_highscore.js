
Ptero.scene_highscore = (function(){

	var backplate;
	var backplatePos;

	var backBtn;

	var killsBtn0, killsBtn1;
	var capsBtn0, capsBtn1;
	var bountiesBtn0, bountiesBtn1;
	var accuracyBtn0, accuracyBtn1;
	
	var scoreBtn;

	var wrenchBtn;
	var strongBtn;
	var scrollBtn;

	function cleanup() {

		wrenchBtn.disable();
		strongBtn.disable();
		scrollBtn.disable();

		backBtn.disable();
	}

	function makeTable() {
		var cellW = 550;
		var cellH = 100;
		var y = 0.35;
		var dy = 80/720;

		killsBtn0 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["whitefont"],
			textAlign: "left",
			text: "KILLS:",
			hudPos: {x:0.5, y:y},
			width: cellW,
			height: cellH,
		});
		killsBtn1 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["scorefont"],
			textAlign: "right",
			text: Ptero.settings.get("high_kills").toString(),
			hudPos: {x:0.5, y:y},
			width: cellW,
			height: cellH,
		});

		capsBtn0 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["whitefont"],
			textAlign: "left",
			text: "CAPTURES:",
			hudPos: {x:0.5, y:y+dy},
			width: cellW,
			height: cellH,
		});
		capsBtn1 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["scorefont"],
			textAlign: "right",
			text: Ptero.settings.get("high_captures").toString(),
			hudPos: {x:0.5, y:y+dy},
			width: cellW,
			height: cellH,
		});

		bountiesBtn0 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["whitefont"],
			textAlign: "left",
			text: "BOUNTIES:",
			hudPos: {x:0.5, y:y+dy*2},
			width: cellW,
			height: cellH,
		});
		bountiesBtn1 = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts["scorefont"],
			textAlign: "right",
			text: Ptero.settings.get("high_bounties").toString(),
			hudPos: {x:0.5, y:y+dy*2},
			width: cellW,
			height: cellH,
		});
	}

	var time;
	function init() {
		time = 0;

		// backplate
		var w = 600;
		var h = 720;
		backplate = Ptero.assets.sprites['backplate_mountain'];
		var frustum = Ptero.frustum;
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};
		
		makeTable();

		scoreBtn = new Ptero.TextButton({
			fontSprite: Ptero.assets.fonts['whitefont'],
			textAlign: "center",
			text: Ptero.settings.get("high_score").toString(),
			hudPos: {x:0.5, y:0.2},
			width: 400,
			height: 200,
		});

		var screenW = Ptero.screen.getWindowWidth();
		var startX = screenW/2 + w/2;
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

		backplate.draw(ctx, backplatePos);

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

		scoreBtn.draw(ctx);

		killsBtn0.draw(ctx);
		killsBtn1.draw(ctx);
		capsBtn0.draw(ctx);
		capsBtn1.draw(ctx);
		bountiesBtn0.draw(ctx);
		bountiesBtn1.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup:cleanup,
		isVibrate: function() { return vibrate; },
	};

})();
