
Ptero.Pinboard.scene_pinboard = (function(){

	var image,pos,billboard;
	var imageTouchHandler = (function(){
		var dx,dy;

		var moveFunc;

		function getResizeFunc(cx,cy) {
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

			var minDistSq = 100;
			var fracs = [0, 0.5, 1];
			var mix,miy,dx,dy,ix,iy;
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

			var funcs = [];
			if (mix == 0) {
				funcs.push(function(wx,wy) {
					billboard.setLeftSide(wx-dx,pos);
				});
			}
			else if (mix == 2) {
				funcs.push(function(wx,wy) {
					billboard.setRightSide(wx-dx,pos);
				});
			}
			
			if (miy == 0) {
				funcs.push(function(wx,wy) {
					billboard.setTopSide(wy-dy,pos);
				});
			}
			else if (miy == 2) {
				funcs.push(function(wx,wy) {
					billboard.setBottomSide(wy-dy,pos);
				});
			}

			if (funcs.length == 0) {
				return null;
			}
			else {
				var i,len = funcs.length;
				return function(wx,wy) {
					for (i=0; i<len; i++) {
						funcs[i](wx,wy);
					}
				};
			}
		}
		return {
			coord: "canvas",
			start: function(cx,cy) {
				var isInside = billboard.isInsideCanvasRect(cx,cy,pos);
				moveFunc = getResizeFunc(cx,cy);

				if (!moveFunc && isInside) {
					var w = Ptero.screen.canvasToWindow(cx,cy);
					dx = w.x - pos.x;
					dy = w.y - pos.y;
					moveFunc = function(wx,wy) {
						pos.x = wx - dx;
						pos.y = wy - dy;
					};
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

		image = Ptero.assets.images['logo'];
		billboard = new Ptero.Billboard(0,0,image.width,image.height);
		pos = {x:0,y:0};

		window.addEventListener("keydown", function(e) {
			if (e.keyCode == 18) {
				isZoomPanKey = true;
			}
		});
		window.addEventListener("keyup", function(e) {
			if (e.keyCode == 18) {
				isZoomPanKey = false;
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
		Ptero.painter.drawImage(ctx,image,pos,billboard);
		var radius = 4 / Ptero.screen.getWindowScale();
		ctx.lineWidth = 3 / Ptero.screen.getWindowScale();
		ctx.fillStyle = "#F00";
		ctx.strokeStyle = "#F00";
		var rect = billboard.getWindowRect(pos);
		ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
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
	};
})();
