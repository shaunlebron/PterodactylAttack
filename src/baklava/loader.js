
Ptero.Baklava.loader = (function(){

	function push() {
		var mode = Ptero.Baklava.model.mode;
		var layers = [];
		var bg = Ptero.background;
		var i,len = bg.layers.length;
		if (mode == 'position') {
			for (i=0; i<len; i++) {
				layers.push({
					'depth': bg.layers[i].depth,
				});
			}
		}
		else if (mode == 'collision') {
			for (i=0; i<len; i++) {
				layers.push({
					'collisionShapes': bg.layers[i].getCollisionStates(),
				});
			}
		}
		else if (mode == 'parallax') {
			for (i=0; i<len; i++) {
				layers.push({
					'parallaxOffset': bg.layers[i].parallaxOffset,
				});
			}
		}

		var data = JSON.stringify(layers);
		$.ajax({
			url: 'bgtool/'+bg.name,
			type: 'POST',
			data: data,
		}).done(function(data) {
			bootbox.alert("Successfully pushed to server");
		}).fail(function(data) {
			bootbox.alert("Failed to push to server: "+data);
		});
	}

	return {
		push: push,
	};
})();
