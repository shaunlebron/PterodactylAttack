Ptero.stage_script = (function(){

	var time_populator;
	var dc_populator;

	var eventScript = new Ptero.TimedScript([
		{
			time: 0,
			action: function() {
				time_populator = new Ptero.TimePopulator({
					clustersPerSecond: 0.5,
					hpLow: 5,
					pteroLow: 2,
					isComposite: false,
					timeDuration: 6,
					libraries: libraries,
				});
			},
		},
	]);
	
	var time;
	var libraries;

	function init() {
		eventScript.init();
		libraries = [
			Ptero.waveLibraries['A'],
			Ptero.waveLibraries['B'],
		];
	}

	function update(dt) {
		
		eventScript.update(dt);

		time_populator && time_populator.update(dt);
		dc_populator && dc_populator.update(dt);
	}

	return {
		init: init,
		update: update,
	};

})();
