Ptero.scene_thanks = (function(){
	var buttonList;

	var heartBtn;

	function cleanup() {
		buttonList.disable();
	}

	function drawHeart(ctx) {
		var heartW = 645;
		var heartH = 585;
		ctx.save();
		var board = heartBtn.billboard;
		board.transform(ctx, heartBtn.pos);
		ctx.scale(
			board.w / heartW,
			board.h / heartH
		);
		ctx.fillStyle='#ff0000';
		ctx.beginPath();
		ctx.moveTo(297,551);
		ctx.bezierCurveTo(284,535,249,505,221,484);
		ctx.bezierCurveTo(137,421,126,412,92,380);
		ctx.bezierCurveTo(29,323,2,265,3,186);
		ctx.bezierCurveTo(3,148,5,133,16,110);
		ctx.bezierCurveTo(34,72,61,43,95,26);
		ctx.bezierCurveTo(120,13,132,8,172,8);
		ctx.bezierCurveTo(215,7,224,12,249,26);
		ctx.bezierCurveTo(279,43,310,79,317,104);
		ctx.lineTo(321,120);
		ctx.lineTo(331,98);
		ctx.bezierCurveTo(387,-23,564,-21,626,101);
		ctx.bezierCurveTo(646,140,648,224,631,271);
		ctx.bezierCurveTo(608,332,565,379,467,450);
		ctx.bezierCurveTo(402,497,329,568,324,578);
		ctx.bezierCurveTo(318,590,323,580,297,551);
		ctx.closePath();
		ctx.fill();
		ctx.lineWidth = 30;
		ctx.strokeStyle = "#FFF";
		ctx.stroke();
		ctx.restore();
	}

	function init() {
		buttonList = new Ptero.ButtonList(Ptero.assets.json["btns_thanks"]);

		var btns = buttonList.namedButtons;

		heartBtn = btns["heart"];
		heartBtn.onclick = function() {
		};

		btns["wrench"].onclick = function() {
			Ptero.setScene(Ptero.scene_options);
		};

		btns["strong"].onclick = function() {
			Ptero.setScene(Ptero.scene_highscore);
		};

		btns["scroll"].onclick = function() {
			Ptero.setScene(Ptero.scene_credits);
		};

		var b = btns["back"];
		b.isClickDelay = true;
		b.onclick = function() {
			Ptero.setScene(Ptero.scene_menu);
		};

		b = btns["back_to_credits"];
		b.onclick = function() {
			Ptero.scene_credits.resumePreviousScroll();
			Ptero.setScene(Ptero.scene_credits);
		};

		buttonList.enable();
	}

	function update(dt) {
	}

	function draw(ctx) {
		Ptero.deferredSprites.draw(ctx);
		buttonList.draw(ctx);
		drawHeart(ctx);
	}

	return {
		init: init,
		update: update,
		draw: draw,
		cleanup: cleanup,
	};
})();
