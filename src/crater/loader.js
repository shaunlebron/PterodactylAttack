
Ptero.Crater.loader = (function(){

	function getState() {
		var models = Ptero.Crater.enemy_model_list.models;
		var i,len = models.length;
		var state = {
			version: 1,
			models: [],
		};
		for (i=0; i<len; i++) {
			state.models.push(models[i].getState());
		}
		return state;
	}

	function setState(state) {
		var models = [];
		var i,len = state.models.length;
		for (i=0; i<len; i++) {
			models.push(Ptero.Crater.EnemyModel.fromState(state.models[i]));
		}
		Ptero.Crater.enemy_model_list.setModels(models);
	}

	function backup() {
		var state = getState();
		var stateStr = JSON.stringify(state);
		if (window.localStorage != undefined) {
			window.localStorage.ptalagaState = stateStr;
		}
		var btn = document.getElementById("save-button");
		btn.href = "data:application/json;base64," + btoa(stateStr);
		btn.download = "wave.json";
	}

	function restore() {
		try {
			if (window.localStorage) {
				var state = JSON.parse(window.localStorage.ptalagaState);
				if (state) {
					setState(state);
					backup();
					return true;
				}
			}
		}
		catch (e) {
		}
		return false;
	}

	// open file dialog
	function openFile() {
	}

	// save file dialog
	function saveFile() {
	}

	return {
		backup: backup,
		restore: restore,
	};
})();
