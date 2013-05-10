
Ptero.Fourier.loader = (function(){

	////////////////////////////////////////////////////////////////////////////////////
	// OPEN FILE HANDLERS

	// Create a function to read and parse a JSON file.
	function makeJSONFileReader(parser) {
		return function openFile(f) {
			var reader = new FileReader();
			reader.onload = function(e) {
				try {
					var json = JSON.parse(e.target.result);
					parser(json);
				}
				catch (e) {
					bootbox.alert("Could not load file '"+f.name+"'");
				}
			};
			reader.readAsText(f);
		};
	}

	// Create a function to handle the event from an open-file dialog or file on-drop operation.
	function createOpenFileHandler(reader) {
		return function handleOpenFile(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var files = evt.target.files;
			if (files) {
				var i,len=files.length;
				for (i=0; i<len; i++) {
					reader(files[i]);
				}
			}
			else {
				files = evt.dataTransfer.files;
				if (files) {
					var i,len=files.length;
					for (i=0; i<len; i++) {
						reader(files[i]);
					}
				}
			}
		};
	};

	// Create a function to handle an open file event and read/parse the JSON contents.
	function createOpenJSONFileHandler(parser) {
		var jsonReader = makeJSONFileReader(parser);
		return createOpenFileHandler(jsonReader);
	};

	////////////////////////////////////////////////////////////////////////////////////
	// IMPORT WAVE

	var importWaveHandler = createOpenJSONFileHandler(function(json){
		Ptero.Fourier.wave_list.addWaveFromState(json);
	});

	////////////////////////////////////////////////////////////////////////////////////
	// STATE MGMT

	function restore() {
		return false;
	}

	function reset() {
		var wave_list = new Ptero.Fourier.WaveList();
		Ptero.Fourier.wave_list = wave_list;
		Ptero.Fourier.wave = null;
		wave_list.refreshTabs();
	}

	return {
		importWaveHandler: importWaveHandler,
		restore: restore,
		reset: reset,
	};
})();
