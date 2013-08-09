
Ptero.scene_pre_play = (function(){

	var backBtn;

	var titleSprite, titlePos;

	var mountainBtn, iceBtn, volcanoBtn;

	function cleanup() {
		mountainBtn.disable();
		iceBtn.disable();
		volcanoBtn.disable();
		backBtn.disable();
	}

	function startGame(stage) {
		Ptero.scene_play.setStage(stage);
		Ptero.setScene(Ptero.scene_play);
		Ptero.audio.getTitleSong().fadeOut(2.0);
	}

	var time;
	function init() {
		time = 0;

		resetPanes();

		makeFramePositions();

		titleSprite = Ptero.assets.sprites['menu_whereto'];
		titlePos = Ptero.screen.screenFracToSpace(0.5, 0.15);

		mountainBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['frame_mountain'],
			hudPos: { x: 0.2, y:0.5 },
			onclick: function() {
				startGame('mountain');
			},
		});
		mountainBtn.enable();

		iceBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['frame_ice'],
			hudPos: { x: 0.5, y:0.5 },
			onclick: function() {
				startGame('ice');
			},
		});
		iceBtn.enable();

		volcanoBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['frame_volcano'],
			hudPos: { x: 0.8, y:0.5 },
			onclick: function() {
				startGame('volcano');
			},
		});
		volcanoBtn.enable();

		backBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['btn_back'],
			hudPos: { x: 0.5, y:0.85 },
			onclick: function() {
				Ptero.setScene(Ptero.scene_menu);
			},
		});
		backBtn.enable();
	}

	var framePositions;
	function makeFramePositions() {
		var frustum = Ptero.screen.getFrustum();
		var x = frustum.nearRight/3*2;
		framePositions = [
			{
				x: -x,
				y: 0,
				z: frustum.near,
			},
			{
				x: 0,
				y: 0,
				z: frustum.near,
			},
			{
				x: x,
				y: 0,
				z: frustum.near,
			},
		];
	}

	var topPaneY;
	var botPaneY;
	var topPaneY2;
	var botPaneY2;
	function resetPanes() {
		var h = Ptero.screen.getHeight();
		topPaneY = 0;
		topPaneY2 = h/10*3;
		botPaneY = h;
		botPaneY2 = h/10*7;
	}
	function updatePanes() {
		topPaneY += (topPaneY2 - topPaneY) * 0.3;
		botPaneY += (botPaneY2 - botPaneY) * 0.3;
	}
	function drawPanes(ctx) {
		var w = Ptero.screen.getWidth();
		var h = Ptero.screen.getHeight();

		ctx.fillStyle = "rgba(255,255,255,0.6)";

		ctx.fillRect(0,0,w,topPaneY);
		ctx.fillRect(0,botPaneY,w,h);
	}

	function update(dt) {
		time += dt;

		updatePanes();
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		drawPanes(ctx);

		titleSprite.draw(ctx, titlePos);

		mountainBtn.draw(ctx);
		iceBtn.draw(ctx);
		volcanoBtn.draw(ctx);

		backBtn.draw(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup: cleanup,
	};

})();
