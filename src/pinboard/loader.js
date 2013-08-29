Ptero.Pinboard.loader = (function(){

	function promptReset() {
		bootbox.confirm('Are you sure you want to discard this pinboard and start a new one?',
			function(result) {
				if (result) {
					reset();
				}
			}
		);
	}

	function reset() {
		Ptero.Pinboard.scene_pinboard.resetState();
	}

	function backup() {
		var state = Ptero.Pinboard.scene_pinboard.getState();
		var stateStr = JSON.stringify(state,null,'\t');
		if (window.localStorage != undefined) {
			window.localStorage.pinboardState = stateStr;
		}
		var btn = document.getElementById("save-button");
		btn.href = "data:application/json;base64," + btoa(stateStr);
		btn.download = "pinboard.json";
	}

	function restore() {
		try {
			if (window.localStorage) {
				var stateStr = window.localStorage.pinboardState;
				console.log(stateStr);
				var state = JSON.parse(stateStr);
				if (state) {
					Ptero.Pinboard.scene_pinboard.setState(state);
					return true;
				}
			}
		}
		catch (e) {
		}
		return false;
	}

	function handleDropImage(e) {
		e.preventDefault();

		var files = e.dataTransfer.files || e.target.files;
		var file = files[0];
		if (!file.type.match('image.*')) {
			bootbox.alert('You can only drag images into this area');
		}
		else {
			var reader = new FileReader();
			reader.onload = function(a) {
				Ptero.Pinboard.scene_pinboard.addNewImage(file.name, a.target.result);
			};
			reader.readAsDataURL(file);
		}
	}

	function openFile(f) {
		var reader = new FileReader();
		reader.onload = function(e) {
			try {
				var state = JSON.parse(e.target.result);
				Ptero.Pinboard.scene_pinboard.setState(state);
			}
			catch (e) {
				bootbox.alert("Could not load file '"+f.name+"'");
			}
		};
		reader.readAsText(f);
	}

	// open file dialog
	function handleOpenFile(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var files = evt.target.files;
		if (files) {
			openFile(files[0]);
		}
		else {
			files = evt.dataTransfer.files;
			if (files) {
				openFile(files[0]);
			}
		}
	}
	
	return {
		backup: backup,
		restore: restore,
		reset: reset,
		promptReset: promptReset,
		handleDropImage: handleDropImage,
		handleOpenFile: handleOpenFile,
	};
})();
