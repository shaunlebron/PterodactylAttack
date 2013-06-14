
Ptero.Baklava.loader = (function(){

	function pull() {
		$.ajax({
			url:'img/bgLayerDepths.json',
			type:'GET',
		}).done(function(data) {
			try {
				setState(data);
				bootbox.alert("Successfully pulled from server");
			}
			catch (e) {
				bootbox.alert("Could not pull from server");
			}
		}).fail(function(data) {
            bootbox.alert("Could not pull from server");
		});
	}

	function push() {
		var data = JSON.stringify(getState());
		$.ajax({
			url: 'img/bgLayerDepths.json',
			type: 'POST',
			data: data,
		}).done(function(data) {
			bootbox.alert("Successfully pushed to server");
		}).fail(function(data) {
			bootbox.alert("Failed to push to server: "+data);
		});
	}


	function getState() {
		return {
			version: 1,
			depths: Ptero.background.getLayerDepths(),
			collisions: Ptero.background.getLayerCollisionStates(),
			parallaxOffsets: Ptero.background.getLayerParallaxOffsets(),
		};
	}

	function setState(state) {
		Ptero.background.setLayerDepths(state.depths);
		Ptero.background.setLayerCollisionStates(state.collisions);
		Ptero.background.setLayerParallaxOffsets(state.parallaxOffsets);
		backup();
	}

	function backup() {
		var state = getState();
		var stateStr = JSON.stringify(state,null,'\t');
		if (window.localStorage != undefined) {
			window.localStorage.parallaxState = stateStr;
		}
	}

	function restore() {
		try {
			if (window.localStorage) {
				var state = JSON.parse(window.localStorage.parallaxState);
				if (state) {
					setState(state);
					return true;
				}
			}
		}
		catch (e) {
		}
		return false;
	}

	return {
		backup: backup,
		restore: restore,
		push: push,
		pull: pull,
	};
})();
