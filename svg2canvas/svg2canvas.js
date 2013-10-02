/*

USAGE:
	svg2canvas(inputText, function callback(outputText) { });

DEPENDENCY:
	<canvas id="canvasCanvgResult"></canvas>
	(Place this anywhere in the page)

CREDITS:
	Omni Software Systems Svg2Canvas Processor + Canvg

COMMENTS:
	This is extracted from minified JS source, so forgive the cryptic variable names.

*/
var svg2canvas = (function(){

	var onDone;
	var i,n;

	function makeCanvg() {
		if (!i) {
			n = $('#canvasCanvgResult');
			i = n.ossCanvg({
				onError: function (n) {
					setTimeout(function () {
						var t = "ossCanvg:SVG Parse Error:" + n.name + "\nError:" + n.message;
						alert(t);
					}, 50)
				},
				canvg: {
					onDrawComplete: function () {
						var t = "",
							r = i.getLog(0),
							u, f, e;

						t = "'use strict';\n";
						u = n[0].svg;
						f = i.CtxName();
						e = f + ".canvas.width=" + u.ViewPort.width() + ";\n" + f + ".canvas.height=" + u.ViewPort.height() + ";";
						t += e;
						u = f = null;

						t += i.getLog();
						onDone(t);

						n.ossCanvg("reset", "")
					}
				}
			}).ossCanvg("getOSS2DCTX");
		}
	}

	return function vt(i, callback) {
		makeCanvg();

		onDone = callback;

		var r = "undefined";
		var nt = "width";
		var tt = "height";
		var it = "viewBox";
		var pt = "preserveAspectRatio";

		var o, e, h, v;
		ft = (new Date).getTime();
		try {
			o = $($.parseXML(i));
			e = o.find("svg:first");
			if (e.length) {
				e.removeAttr("onload");
				i = typeof XMLSerializer != r ? {
					xmlns: "http://www.w3.org/2000/svg",
					version: "1.1"
				} : {};
				h = e.attr(nt);
				v = e.attr(tt);
				typeof h == r && (i[nt] = n.width());
				typeof v == r && (i[tt] = n.height());
				typeof e.attr(it) == r && (i[it] = "0 0 " + h + " " + v);
				i[pt] = "xMidYMid meet";
				e.attr(i);
				o.find("script").remove();
				i = typeof XMLSerializer != r ? (new XMLSerializer).serializeToString(o[0]) : o[0].xml;
			}
		} catch (y) {
			i = "";
			console.error('something bad happened while svg was parsing',y);
		} finally {
			e = null
		}
		i.length && n.ossCanvg("build", {
			xml: o[0],
			fnId: "",
		});
	};
})();
