(function(){ 
	var url = window.location.pathname;
	var baseName = url.substring(url.lastIndexOf('/')+1).replace(/\..*$/,'');

	var div;
	function addDownloadLink(num,text) {
		if (!div) {
			div = document.createElement('div');
			div.setAttribute('style', 'position: absolute; left:0; top:0');
			document.body.appendChild(div);
		}
		var name = baseName+"_"+num+".svg";
		var a = document.createElement('a');
		a.setAttribute('style','display:block');
		a.innerHTML = name;
		a.href = "data:image/svg+xml;base64," + btoa(text);
		a.download = name;
		div.appendChild(a);
	}
	
	var frames = [];
	var allFrames = "";
	function getSvgFrames() {
		var s = document.getElementsByTagName('svg')[0].outerHTML;
		var i,len = frames.length;
		for (i=0; i<len; i++) {
			if (frames[i] == s) {
				return;
			}
		}
		addDownloadLink(frames.length, s.replace('rectfill','rect fill'));
		frames.push(s);
	}

	window.onload = function() {
		setInterval(getSvgFrames, 15);
	}

})();
