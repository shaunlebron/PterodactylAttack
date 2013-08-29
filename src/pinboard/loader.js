Ptero.Pinboard.loader = (function(){
	
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
	
	return {
		handleDropImage: handleDropImage,
	};
})();
