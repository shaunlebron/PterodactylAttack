
Ptero.pause_menu = (function(){

	var playBtn, optionsBtn, stageSelectBtn, quitBtn;

	function init() {
		var font = "SharkParty";
		var fontSize = Ptero.hud.getTextSize('menu_option');
		var textColor = "#FFF";
		var w = 400;
		var h = 125;
		var dy = 1/5;
		playBtn = new Ptero.TextButton({
			hudPos: { x: 0.5, y: dy },
			text: "Resume",
			textAlign: "center",
			textColor: textColor,
			font: font,
			fontSize: fontSize,
			width: w,
			height: h,
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.scene.enableControls();
			}
		});
		optionsBtn = new Ptero.TextButton({
			hudPos: { x: 0.5, y: dy*2 },
			text: "Options",
			textAlign: "center",
			textColor: textColor,
			font: font,
			fontSize: fontSize,
			width: w,
			height: h,
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.fadeToScene(Ptero.scene_options, 0.25);
			}
		});
		stageSelectBtn = new Ptero.TextButton({
			hudPos: { x: 0.5, y: dy*3 },
			text: "Select Stage",
			textAlign: "center",
			textColor: textColor,
			font: font,
			fontSize: fontSize,
			width: w,
			height: h,
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				if (Ptero.scene == Ptero.scene_survivor) {
					Ptero.fadeToScene(Ptero.scene_pre_survivor, 0.25);
				}
				else if (Ptero.scene == Ptero.scene_timeattack) {
					Ptero.fadeToScene(Ptero.scene_pre_timeattack, 0.25);
				}
			}
		});
		quitBtn = new Ptero.TextButton({
			hudPos: { x: 0.5, y: dy*4 },
			text: "Quit",
			textAlign: "center",
			textColor: textColor,
			font: font,
			fontSize: fontSize,
			width: w,
			height: h,
			onclick: function() {
				Ptero.executive.togglePause();
				cleanup();
				Ptero.fadeToScene(Ptero.scene_menu, 0.25);
			}
		});
	}

	function draw(ctx) {
		playBtn.draw(ctx);
		optionsBtn.draw(ctx);
		stageSelectBtn.draw(ctx);
		quitBtn.draw(ctx);
	}

	function cleanup() {
		playBtn.disable();
		optionsBtn.disable();
		stageSelectBtn.disable();
		quitBtn.disable();
	}

	function enable() {
		playBtn.enable();
		optionsBtn.enable();
		stageSelectBtn.enable();
		quitBtn.enable();
		Ptero.scene.disableControls();
	}

	return {
		init: init,
		cleanup: cleanup,
		enable: enable,
		draw: draw,
	};
})();
