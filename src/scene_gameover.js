
Ptero.scene_gameover = (function(){

	var backplate;
	var backplatePos;

	var replayBtn,quitBtn;

	var highScoreSprite, highScorePos;

	function cleanup() {
		replayBtn.disable();
		quitBtn.disable();
	}

	function switchScene(scene) {
		Ptero.audio.getScoreSong().fadeOut(1.0);
		Ptero.fadeToScene(scene,0.5);
	}

	var scoreBoard,digits;
	var scorePos;
	function makeScoreBoard() {
		var m = Ptero.assets.mosaics['timertype'];
		
		digits = Ptero.score.getTotal() + "";

		// get the total width of the score
		var i,len=digits.length;
		var d;
		var w=0,h;
		for (i=0; i<len; i++) {
			d = digits[i]
			h = m.frames[d].origSize.height;
			w += m.frames[d].origSize.width;
		}

		// create a billboard of that size of the desired scale
		scoreBoard = new Ptero.Billboard(w/2,h/2,w,h,2);

		scorePos = Ptero.screen.screenFracToSpace(0.5, 0.2 );
	}

	function init() {
		Ptero.audio.getScoreSong().play();
		Ptero.overlord.stopScript();

		makeScoreBoard();

		highScoreSprite = Ptero.assets.sprites['menu_highscore'];
		highScorePos = Ptero.screen.screenFracToSpace(0.5, 0.3);

		scorePos = Ptero.screen.screenFracToSpace(0.5, 0.2 );

		var w = 600;
		var h = 720;
		backplate = new Ptero.Billboard(w/2,h/2,w,h,1);
		var frustum = Ptero.screen.getFrustum();
		backplatePos = {
			x: 0,
			y: 0,
			z: frustum.near,
		};

		replayBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_replay'],
			hudPos: {x:0.5, y:0.5},
			onclick: function() {
				switchScene(Ptero.scene_play);
				//Ptero.audio.playSelect();
			},
		});
		replayBtn.enable();

		quitBtn = new Ptero.SpriteButton({
			sprite: Ptero.assets.sprites['menu_quit'],
			hudPos: {x:0.5, y:0.7},
			onclick: function() {
				switchScene(Ptero.scene_pre_play);
			},
		});
		quitBtn.enable();

		commitHighScore();

        Ptero.orb.setNextOrigin(0,-2);
	}

	var newHighScore;
	function commitHighScore() {
		newHighScore = false;
		var highScore = Ptero.score.getHighScore();
		var currentHigh = highScore || 0;
		var currentScore = Ptero.score.getTotal();
		if (currentScore > currentHigh) {
			newHighScore = true;
			Ptero.score.commitHighScore();
		}
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);

		ctx.fillStyle = "rgba(0,0,0,0.7)";
		backplate.fill(ctx, backplatePos);

		Ptero.orb.draw(ctx);
		replayBtn.draw(ctx);
		quitBtn.draw(ctx);

		// draw score
		ctx.save();
		scoreBoard.transform(ctx, scorePos);
		var m = Ptero.assets.mosaics['timertype'];
		var j,len=digits.length;
		var d;
		var x=0,y=0;
		for (j=0; j<len; j++) { // each digit
			d = digits[j];

			var frame = m.frames[d];
			var size = frame.origSize;

			var tiles = frame.tiles;
			var i,numTiles = tiles.length;
			var sx,sy,w,h,dx,dy;
			var tile;
			for (i=0; i<numTiles; i++) { // each segment of digit
				tile = tiles[i];

				sx = tile.x;
				sy = tile.y;
				w = tile.w;
				h = tile.h;
				dx = x+tile.origX;
				dy = tile.origY;

				ctx.drawImage(m.img, sx,sy,w,h,dx,dy,w,h);
			}

			x += size.width;
		}
		ctx.restore();

		if (newHighScore) {
			highScoreSprite.draw(ctx, highScorePos);
		}
	}

	function update(dt) {
		Ptero.orb.update(dt);
		Ptero.overlord.update(dt);
	}

	return {
		init:init,
		draw:draw,
		update:update,
		cleanup: cleanup,
	};
})();
