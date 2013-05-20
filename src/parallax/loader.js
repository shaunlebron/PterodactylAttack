
Ptero.Parallax.loader = (function(){

	function pullDepths() {
		$.ajax({
			url:'img/bgLayerDepths.json',
			type:'GET',
		}).done(function(data) {
			try {
				setState(JSON.parse(data));
				bootbox.alert("Successfully pulled depths from server");
			}
			catch (e) {
				bootbox.alert("Could not pull depths from server");
			}
		}).fail(function(data) {
				bootbox.alert("Could not pull depths from server");
		});
	}

	function pushDepths() {
		var data = JSON.stringify(getState());
		console.log(data);
		$.ajax({
			url: 'img/bgLayerDepths.json',
			type: 'POST',
			data: data,
		}).done(function(data) {
			bootbox.alert("Successfully pushed depths to server");
		}).fail(function(data) {
			bootbox.alert("Failed to push depths to server: "+data);
		});
	}


	function getState() {
		return {
			version: 1,
			depths: Ptero.background.getLayerDepths(),
		};
	}

	function setState(state) {
		Ptero.background.setLayerDepths(state.depths);
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
		pushDepths: pushDepths,
		pullDepths: pullDepths,
	};
})();
