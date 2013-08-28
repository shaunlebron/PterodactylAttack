
Ptero.Pinboard.scene_pinboard = (function(){

	var objects = [];
	var selectedIndex;

	function selectIndex(i) {
		selectedIndex = i;
	}

	function createNewImageObject(name) {
		var image = Ptero.assets.images[name];
		var o = {
			image:     image,
			pos:       {x:0, y:0},
			billboard: new Ptero.Billboard(0,0,image.width,image.height),
		};
		objects.push(o);
	}

	function setNewAspect(aspect) {
		var w = Ptero.screen.getWindowWidth();
		var h = Ptero.screen.getWindowHeight();
		var i,len=objects.length;
		for (i=0; i<len; i++) {
			var pos = objects[i].pos;
			pos.x = pos.x / w * h * aspect;
		}
	}

	var isStiffResizeKey;
	var isSnapKey;
	var imageTouchHandler = (function(){

		var image,pos,billboard;
		var moveFunc;
		var touchRadiusSq = 100;

		function snap(val,valToSnap) {
			var snapRadius = 10 / Ptero.screen.getWindowScale();
			return (Math.abs(val-valToSnap) < snapRadius) ? valToSnap : val;
		}

		function getMoveAnchorFunc(obj,cx,cy) {
			var billboard = obj.billboard;
			var pos = obj.pos;

			var rect = billboard.getCanvasRect(pos);
			var a = Ptero.screen.windowToCanvas(pos.x, pos.y);
			var dx = cx - a.x;
			var dy = cy - a.y;
			var distSq = dx*dx + dy*dy;
			if (distSq < touchRadiusSq) {
				return function(wx,wy) {
					wx -= dx/Ptero.screen.getWindowScale();
					wy -= dy/Ptero.screen.getWindowScale();
					var windowRect = billboard.getWindowRect(pos);
					if (isSnapKey) {
						wx = snap(wx, windowRect.x);
						wx = snap(wx, windowRect.x + windowRect.w/2);
						wx = snap(wx, windowRect.x + windowRect.w);
						wy = snap(wy, windowRect.y);
						wy = snap(wy, windowRect.y + windowRect.h/2);
						wy = snap(wy, windowRect.y + windowRect.h);
					}
					billboard.setCenter(wx - windowRect.x, wy - windowRect.y);
					pos.x = wx;
					pos.y = wy;
				};
			}
		}

		function getResizeFunc(obj,cx,cy) {
			var billboard = obj.billboard;
			var pos = obj.pos;

			var rect = billboard.getCanvasRect(pos);
			function dist(xf,yf) {
				var dx = cx - (rect.x + xf * rect.w);
				var dy = cy - (rect.y + yf * rect.h);
				var distSq = dx*dx + dy*dy;
				return {
					distSq: distSq,
					dx: dx,
					dy: dy,
				};
			}

			var fracs = [0, 0.5, 1];
			var mix,miy,dx,dy,ix,iy;
			var minDistSq = touchRadiusSq;
			for (ix=0; ix<3; ix++) {
				for (iy=0; iy<3; iy++) {
					if (ix == 1 && iy == 1) {
						continue;
					}
					var d = dist(fracs[ix],fracs[iy]);
					if (d.distSq < minDistSq) {
						minDistSq = d.distSq;
						mix = ix;
						miy = iy;
						dx = d.dx;
						dy = d.dy;
					}
				}
			}
			dx /= Ptero.screen.getWindowScale();
			dy /= Ptero.screen.getWindowScale();

			var func;
			if (mix == 0 && miy == 1) {
				func = function(wx,wy) {
					billboard.setLeftSide(wx-dx,pos);
				};
			}
			else if (mix == 2 && miy == 1) {
				func = function(wx,wy) {
					billboard.setRightSide(wx-dx,pos);
				};
			}
			else if (mix == 1 && miy == 0) {
				func = function(wx,wy) {
					billboard.setTopSide(wy-dy,pos);
				};
			}
			else if (mix == 1 && miy == 2) {
				func = function(wx,wy) {
					billboard.setBottomSide(wy-dy,pos);
				};
			}
			else if (mix == 0 && miy == 0) {
				func = function(wx,wy) {
					var aspect = billboard.w / billboard.h;
					billboard.setTopSide(wy-dy,pos);
					billboard.setLeftSide(wx-dx,pos);
					if (isStiffResizeKey) {
						var rect = billboard.getWindowRect(pos);
						var newAspect = billboard.w / billboard.h;
						if (newAspect > aspect) {
							var w = rect.h * aspect;
							billboard.setLeftSide(rect.x + rect.w - w, pos);
						}
						else {
							var h = rect.w / aspect;
							billboard.setTopSide(rect.y + rect.h - h, pos);
						}
					}
				}
			}
			else if (mix == 2 && miy == 0) {
				func = function(wx,wy) {
					var aspect = billboard.w / billboard.h;
					billboard.setTopSide(wy-dy,pos);
					billboard.setRightSide(wx-dx,pos);
					if (isStiffResizeKey) {
						var rect = billboard.getWindowRect(pos);
						var newAspect = billboard.w / billboard.h;
						if (newAspect > aspect) {
							var w = rect.h * aspect;
							billboard.setRightSide(rect.x + w, pos);
						}
						else {
							var h = rect.w / aspect;
							billboard.setTopSide(rect.y + rect.h - h, pos);
						}
					}
				}
			}
			else if (mix == 0 && miy == 2) {
				func = function(wx,wy) {
					var aspect = billboard.w / billboard.h;
					billboard.setBottomSide(wy-dy,pos);
					billboard.setLeftSide(wx-dx,pos);
					if (isStiffResizeKey) {
						var rect = billboard.getWindowRect(pos);
						var newAspect = billboard.w / billboard.h;
						if (newAspect > aspect) {
							var w = rect.h * aspect;
							billboard.setLeftSide(rect.x + rect.w - w, pos);
						}
						else {
							var h = rect.w / aspect;
							billboard.setBottomSide(rect.y + h, pos);
						}
					}
				}
			}
			else if (mix == 2 && miy == 2) {
				func = function(wx,wy) {
					var aspect = billboard.w / billboard.h;
					billboard.setBottomSide(wy-dy,pos);
					billboard.setRightSide(wx-dx,pos);
					if (isStiffResizeKey) {
						var rect = billboard.getWindowRect(pos);
						var newAspect = billboard.w / billboard.h;
						if (newAspect > aspect) {
							var w = rect.h * aspect;
							billboard.setRightSide(rect.x + w, pos);
						}
						else {
							var h = rect.w / aspect;
							billboard.setBottomSide(rect.y + h, pos);
						}
					}
				}
			}

			return func;
		}

		function getMoveImageFunc(obj,cx,cy) {
			var billboard = obj.billboard;
			var pos = obj.pos;

			if (billboard.isInsideCanvasRect(cx,cy,pos)) {
				var w = Ptero.screen.canvasToWindow(cx,cy);
				dx = w.x - pos.x;
				dy = w.y - pos.y;
				return function(wx,wy) {
					wx -= dx;
					wy -= dy;
					var windowRect = {
						x: 0,
						y: 0,
						w: Ptero.screen.getWindowWidth(),
						h: Ptero.screen.getWindowHeight(),
					};
					if (isSnapKey) {
						wx = snap(wx, windowRect.x);
						wx = snap(wx, windowRect.x + windowRect.w/2);
						wx = snap(wx, windowRect.x + windowRect.w);
						wy = snap(wy, windowRect.y);
						wy = snap(wy, windowRect.y + windowRect.h/2);
						wy = snap(wy, windowRect.y + windowRect.h);
					}
					pos.x = wx;
					pos.y = wy;
				};
			}
		}

		return {
			coord: "canvas",
			start: function(cx,cy) {

				moveFunc = null;

				var obj = objects[selectedIndex];
				if (obj) {
					moveFunc = getMoveAnchorFunc(obj,cx,cy) || getResizeFunc(obj,cx,cy) || getMoveImageFunc(obj,cx,cy);
				}

				if (!moveFunc) {
					selectIndex(null);
					var i,len=objects.length;
					for (i=0; i<len; i++) {
						obj = objects[i];
						var f = getMoveImageFunc(obj,cx,cy);
						if (f) {
							moveFunc = f;
							selectIndex(i);
						}
					}
				}
			},
			move: function(cx,cy) {
				var w = Ptero.screen.canvasToWindow(cx,cy);
				moveFunc && moveFunc(w.x,w.y);
			},
			end: function(cx,cy) {
				moveFunc = null;
			},
			cancel: function(wx,wy) {
				moveFunc = null;
			},
		};
	})();

	var isZoomPanKey;
	var zoomPanTouchHandler = (function(){
		var dx,dy;
		var isZoomPan;
		
		return {
			coord: "canvas",
			start: function(cx,cy) {
				isZoomPan = isZoomPanKey;
				if (isZoomPan) {
					var c = Ptero.screen.getWindowPos();
					dx = cx - c.x;
					dy = cy - c.y;
				}
			},
			move: function(cx,cy) {
				if (isZoomPan) {
					Ptero.screen.setWindowPos(cx-dx, cy-dy);
				}
			},
			end: function(cx,cy) {
				isZoomPan = false;
			},
			cancel: function(cx,cy) {
				isZoomPan = false;
			},
			scroll: function(cx,cy,delta,deltaX,deltaY) {
				if (isZoomPanKey) {
					// from: http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
					var scaleFactor = Math.pow(1 + Math.abs(deltaY)/4 , deltaY > 0 ? 1 : -1);

					var scale = Ptero.screen.getWindowScale() * scaleFactor;
					var maxScale = Ptero.screen.getWindowFitScale();
					var minScale = maxScale / 8;
					scale = Math.max(minScale, Math.min(maxScale, scale));

					Ptero.screen.zoomWindow(scale, cx, cy);
				}
			},
		};
	})();

	function init() {
		Ptero.setBackground('menu');
		var s = Ptero.screen;
		s.setWindowScale(s.getCanvasHeight() / (s.getWindowHeight()*1.5));
		s.centerWindowAtPixel(s.getCanvasWidth()/2, s.getCanvasHeight()/2);

		createNewImageObject('logo');
		createNewImageObject('button_plank');

		window.addEventListener("keydown", function(e) {
			if (e.keyCode == 18) { // alt
				isZoomPanKey = true;
			}
			else if (e.keyCode == 16) { // shift
				isStiffResizeKey = true;
				isSnapKey = true;
			}
			else if (e.keyCode == 17) { // ctrl
				isPreviewKey = true;
			}
		});
		window.addEventListener("keyup", function(e) {
			if (e.keyCode == 18) {
				isZoomPanKey = false;
			}
			else if (e.keyCode == 16) {
				isStiffResizeKey = false;
				isSnapKey = false;
			}
			else if (e.keyCode == 17) {
				isPreviewKey = false;
			}
		});

		enableTouch();
	}

	function enableTouch() {
		Ptero.input.addTouchHandler(zoomPanTouchHandler);
		Ptero.input.addTouchHandler(imageTouchHandler);
	}
	
	function disableTouch() {
		Ptero.input.removeTouchHandler(zoomPanTouchHandler);
		Ptero.input.removeTouchHandler(imageTouchHandler);
	}
	
	function cleanup() {
		disableTouch();
	}

	var isPreviewKey;
	function draw(ctx) {
		ctx.save();
		Ptero.screen.transformToWindow();
		ctx.save();
		Ptero.screen.clipWindow();
		Ptero.deferredSprites.draw(ctx);
		ctx.restore();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 10;
		ctx.strokeRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());

		// TODO: draw images in depth order here
		var i,len=objects.length;
		for (i=0; i<len; i++) {
			var obj = objects[i];
			var image     = obj.image;
			var pos       = obj.pos;
			var billboard = obj.billboard;
			Ptero.painter.drawImage(ctx,image,pos,billboard);

			if (isPreviewKey) {
				continue;
			}

			if (i == selectedIndex) {
				ctx.lineWidth = 3 / Ptero.screen.getWindowScale();
				ctx.strokeStyle = "#F00";
				var rect = billboard.getWindowRect(pos);
				ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

				var radius = 4 / Ptero.screen.getWindowScale();
				ctx.fillStyle = "#F00";
				(function(){
					var i,j,vals=[0,0.5,1];
					for (i=0; i<3; i++) {
						for (j=0; j<3; j++) {
							if (i==1 && j==1) {
								continue;
							}
							ctx.beginPath();
							ctx.arc(rect.x + rect.w*vals[i], rect.y + rect.h*vals[j], radius, 0, Math.PI*2);
							ctx.fill();
						}
					}
				})();

				var radius = 8 / Ptero.screen.getWindowScale();
				ctx.fillStyle = "#00F";
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
				ctx.fill();
			}
			else {
				ctx.lineWidth = 3 / Ptero.screen.getWindowScale();
				ctx.strokeStyle = "#555";
				var rect = billboard.getWindowRect(pos);
				ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
			}

		}
		ctx.restore();
	}

	function update(dt) {
		Ptero.background.update(dt);
	}

	return {
		init: init,
		cleanup: cleanup,
		draw: draw,
		update: update,
		setNewAspect: setNewAspect,
	};
})();
