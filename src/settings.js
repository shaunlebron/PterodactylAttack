
Ptero.settings = (function(){

	var values;
	function initValues() {
		values = {
			"soundOn": true,
			"vibrateOn": true,
			"tutorialOn": true,
		};
	}
	initValues();

	var key = "settings";

	return {
		load: function() {
			values = null;
			try {
				values = JSON.parse(localStorage[key]);
			}
			catch (e) {
			}

			if (!values) {
				initValues();
			}
			console.log(values);
		},
		save: function() {
			localStorage[key] = JSON.stringify(values);
		},
		enableSound: function(on) {
			values['soundOn'] = on;
			this.save();
		},
		enableVibrate: function(on) {
			values['vibrateOn'] = on;
			this.save();
		},
		enableTutorial: function(on) {
			values['tutorialOn'] = on;
			this.save();
		},
		isSoundEnabled: function() {
			return values['soundOn'];
		},
		isVibrateEnabled: function() {
			return values['vibrateOn'];
		},
		isTutorialEnabled: function() {
			return values['tutorialOn'];
		},
	};
})();
