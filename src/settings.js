
Ptero.settings = (function(){

	var values;
	var defaultValues = {
		"soundOn": true,
		"vibrateOn": true,
		"tutorialOn": true,
		"hand": 'right',
		"high_score": 0,
		"high_kills": 0,
		"high_captures": 0,
		"high_bounties": 0,
	};
	function initValues() {
		if (!values) {
			values = {};
		}

		var name;
		for (name in defaultValues) {
			if (values[name] == undefined) {
				values[name] = defaultValues[name];
			}
		}
	}
	initValues();

	var key = "settings";

	return {
		set: function(key,value) {
			values[key] = value;
			this.save();
		},
		get: function(key) {
			return values[key];
		},
		load: function() {
			values = null;
			try {
				values = JSON.parse(localStorage[key]);
			}
			catch (e) {
			}
			initValues();
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
		setHand: function(hand) {
			values['hand'] = hand;
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
		getHand: function() {
			return values['hand'];
		},
	};
})();
