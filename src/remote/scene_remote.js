
Ptero.Remote.scene_remote = (function() {

	var buttonList;
	var netLeftBtn, netRightBtn;

	function enableControls() {
		if (isNetEnabled) {
			enableNet(true);
		}
		Ptero.Remote.orb.enableTouch();
	}

	var time;
	function init() {
		buttonList = new Ptero.ButtonList(Ptero.Remote.assets.json["btns_remote"]);
		var btns = buttonList.namedButtons;

		netLeftBtn = btns["netLeft"];
		netRightBtn = btns["netRight"];
		netLeftBtn.ontouchstart = netRightBtn.ontouchstart = function(x,y) { Ptero.Remote.orb.enableNet(true); };
		netLeftBtn.ontouchend   = netRightBtn.ontouchend   = function(x,y) { Ptero.Remote.orb.enableNet(false); };
		netLeftBtn.ontouchenter = netRightBtn.ontouchenter = function(x,y) { Ptero.Remote.orb.enableNet(true); };
		netLeftBtn.ontouchleave = netRightBtn.ontouchleave = function(x,y) { Ptero.Remote.orb.enableNet(false); };

		enableControls();

		Ptero.Remote.orb.init();
		Ptero.Remote.orb.setNextOrigin(0,-1);
		console.log('inited scene');
	};

	function update(dt) {
		Ptero.Remote.orb.update(dt);
	};

	function draw(ctx) {
		ctx.fillStyle = "#999";
		ctx.fillRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());
		buttonList.draw(ctx);
		Ptero.Remote.orb.draw(ctx);
	};

	var isNetEnabled = true;
	function enableNet(on) {
		console.log('enable net',on);
		isNetEnabled = on;

		netLeftBtn.disable();
		netRightBtn.disable();
		netLeftBtn.shouldDraw = netRightBtn.shouldDraw = false;

		//var side = Ptero.settings.getNetSide();
		var side = 'left';
		if (on) {
			if (side == 'left') {
				netLeftBtn.enable();
				netLeftBtn.shouldDraw = true;
			}
			else if (side == 'right') {
				netRightBtn.enable();
				netRightBtn.shouldDraw = true;
			}
		}
	}

	return {
		init: init,
		update: update,
		draw: draw,
		enableNet: enableNet,
	};
})();
