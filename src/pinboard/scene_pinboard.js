
Ptero.Pinboard.scene_pinboard = (function(){

	/******************************************************************************/
	// SAVE/LOAD STATES

	function getObjectState(obj) {
		var sw = Ptero.screen.getWindowWidth();
		var sh = Ptero.screen.getWindowHeight();
		return {
			name      : obj.name,
			x         : obj.pos.x/sw,
			y         : obj.pos.y/sh,
			centerX   : obj.billboard.centerX,
			centerY   : obj.billboard.centerY,
			w         : obj.billboard.w,
			h         : obj.billboard.h,
			font      : obj.font,
			textAlign : obj.textAlign,
			text      : obj.text,
			imageName : obj.imageName,
		};
	}

	function makeObjectFromState(state) {
		var image;
		var sw = Ptero.screen.getWindowWidth();
		var sh = Ptero.screen.getWindowHeight();
		if (state.imageName) {
			image = Ptero.assets.images[state.imageName] || localImages[state.imageName].image;
		}
		return {
			name: state.name,
			pos: { x: state.x*sw, y: state.y*sh },
			billboard: new Ptero.Billboard(state.centerX, state.centerY, state.w, state.h),
			font: state.font,
			textAlign: state.textAlign,
			text: state.text,
			imageName: state.imageName,
			image: image,
		};
	}

	function getState() {
		var state = {
			localImages: {},
			objects: [],
		};

		var i,len=objects.length;
		var objState;
		for (i=0; i<len; i++) {
			objState = getObjectState(objects[i]);
			var imgName = objState.imageName;
			if (localImages[imgName]) {
				state.localImages[imgName] = localImages[imgName].dataUrl;
			}
			state.objects.push(objState);
		}

		return state;
	}

	function setState(state) {
		resetState();

		var numLoaded = 0;
		var numLocalImages = 0;
		var name;
		for (name in state.localImages) {
			numLocalImages++;
		}

		function onLoaded() {
			var i,len=state.objects.length;
			for (i=0; i<len; i++) {
				objects.push(makeObjectFromState(state.objects[i]));
			}
		}

		if (numLocalImages == 0) {
			onLoaded();
		}
		else {
			for (name in state.localImages) {
				var image = new Image();
				var dataUrl = state.localImages[name];
				image.onload = (function(name,image,dataUrl){
					return function() {

						localImages[name] = {
							image: image,
							name: name,
							dataUrl: dataUrl,
						};

						// add to image list
						addImageToListDisplay(name);

						numLoaded++;
						if (numLoaded == numLocalImages) {
							onLoaded();
						}
					};
				})(name,image,dataUrl);
				image.src = dataUrl;
			}
		}
	}

	function resetState() {
		clearObjects();
		clearUndoStack();
		clearLocalImages();
		resetImageListDisplay();

		// init background
		Ptero.setBackground('menu');

		// init camera
		var s = Ptero.screen;
		s.setWindowScale(s.getCanvasHeight() / (s.getWindowHeight()*1.5));
		s.centerWindowAtPixel(s.getCanvasWidth()/2, s.getCanvasHeight()/2);
	}

	/******************************************************************************/
	// UNDO/REDO STACK

	var undoStack = [];
	var undoStackLength = 0;
	var undoStackPos = 0;
	function recordForUndo(f) {
		if (undoStackPos < undoStackLength) {
			undoStack.splice(undoStackPos);
		}
		undoStack.push(f);
		undoStackPos++;
		undoStackLength = undoStackPos;

		Ptero.Pinboard.loader.backup();
	}
	function undo() {
		if (undoStackPos > 0) {
			undoStackPos--;
			undoStack[undoStackPos].undo();
			Ptero.Pinboard.loader.backup();
		}
	}
	function redo() {
		if (undoStackPos < undoStackLength) {
			undoStack[undoStackPos].redo();
			undoStackPos++;
			Ptero.Pinboard.loader.backup();
		}
	}
	function clearUndoStack() {
		undoStack.length = undoStackLength = undoStackPos = 0;
	}

	/******************************************************************************/
	// LOCAL IMAGE IMPORTING

	var localImages = {};
	function clearLocalImages() {
		localImages = {};
	}
	function getNameFromDataUrl(dataUrl) {
		var name, dict;
		for (name in localImages) {
			dict = localImages[name];
			if (dict.dataUrl == dataUrl) {
				return name;
			}
		}
		return null;
	}
	function addNewImage(name, dataUrl, onLoad) {
		// check if already present
		var existingName = getNameFromDataUrl(dataUrl);
		if (existingName) {
			dict = localImages[existingName];
			name = existingName;
		}
		else {
			// create new image object
			var image = new Image();
			image.src = dataUrl;

			// wait for image to load
			image.onload = function() {
				// prevent name collisions by adding asterisks until a new name is found
				while (localImages[name]) {
					name += "*";
				}
				localImages[name] = {
					image: image,
					name: name,
					dataUrl: dataUrl,
				};

				// add to image list
				addImageToListDisplay(name);

				// calling this again to make sure the image is loaded before we proceed
				addNewImage(name, dataUrl);
			};
			return;
		}

		var dict = localImages[name];

		// add new image object
		selectImage(name);
	}

	/******************************************************************************/
	// OBJECT LIST AND SELECTION

	var objects = [];
	var selectedIndex;

	function clearObjects() {
		objects.length = 0;
		selectIndex(null);
	}

	function selectIndex(i) {
		selectedIndex = i;
		refreshTagDisplay();
		refreshTextAlignDisplay();
		refreshTextDisplay();
		refreshFontDisplay();
	}

	/******************************************************************************/
	// DISPLAY BINDING TO OBJECT ATTRIBUTES

	function resetImageListDisplay() {
		var str="";
		str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.selectImage(null)\" href=\"#\">(empty image)</a></li>";
		var images = [
			"logo",
			"backplate_mountain",
			"backplate_ice",
			"net",
			"button_plank",
			"menu_wrench",
			"menu_strong",
			"menu_scroll",
			"btn_back",
			"pause",
			"arrow",
			"arrow2",
		];
		var i,len=images.length;
		for (i=0; i<len; i++) {
			str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.selectImage('" + images[i] + "')\" href=\"#\">" + images[i] + "</a></li>";
		}
		$('#imageMenu').html(str);
	}

	function addImageToListDisplay(name) {
		var $menu = $('#imageMenu');
		var str = $menu.html();
		str += "<li><a onclick=\"Ptero.Pinboard.scene_pinboard.selectImage('" + name + "')\" href=\"#\">" + name + "</a></li>";
		$menu.html(str);
	}

	function refreshFontDisplay() {
		var obj = objects[selectedIndex];
		var font = "";
		if (obj && obj.text && obj.font) {
			font = obj.font;
		}
		$('#fontName').html(font);
	}

	function refreshTagDisplay() {
		var obj = objects[selectedIndex];
		var name = "";
		if (obj && obj.name) {
			name = obj.name;
		}
		$('#objectName').html(name);
	}

	function refreshTextAlignDisplay() {
		$('#text-left-btn').removeClass('active');
		$('#text-right-btn').removeClass('active');
		$('#text-center-btn').removeClass('active');
		
		var obj = objects[selectedIndex];
		if (obj && obj.text && obj.textAlign) {
			$('#text-'+obj.textAlign+'-btn').addClass('active');
		}
	}

	function refreshTextDisplay() {
		var obj = objects[selectedIndex];
		var text = "";
		if (obj && obj.text) {
			text = obj.text;
		}
		var $textInput = $('#textInput');
		if (selectedIndex == null) {
			$textInput.prop('disabled', true);
		}
		else {
			$textInput.prop('disabled', false);
		}
		$textInput.val(text);
	}

	/******************************************************************************/
	// OBJECT MODIFIER INTERFACES

	function setSelectedTextAlign(align) {
		var obj = objects[selectedIndex];
		if (obj) {
			obj.textAlign = align;
			refreshTextAlignDisplay();
			Ptero.Pinboard.loader.backup();
		}
	}

	function setSelectedFont(font) {
		if (selectedIndex != null) {
			objects[selectedIndex].font = font;
			refreshFontDisplay();
			Ptero.Pinboard.loader.backup();
		}
	}

	function updateSelectedText() {
		if (selectedIndex != null) {
			objects[selectedIndex].text = $('#textInput').val();
			refreshTextAlignDisplay();
			refreshFontDisplay();
			Ptero.Pinboard.loader.backup();
		}
	}

	function renameSelectedObject() {
		if (selectedIndex != null) {
			var obj = objects[selectedIndex];
			bootbox.prompt("Rename tag:", "Cancel", "OK", function(result) {
				obj.name = result;
				refreshTagDisplay();
			}, obj.name || "");
			Ptero.Pinboard.loader.backup();
		}
	}

	function orderSelectedObject(order) {
		if (selectedIndex != null) {
			var temp;
			var i = selectedIndex;
			if (order == "forward") {
				if (objects[i+1]) {
					temp = objects[i];
					objects[i] = objects[i+1];
					objects[i+1] = temp;
					selectIndex(selectedIndex+1);
				}
			}
			else if (order == "backward") {
				if (objects[i-1]) {
					temp = objects[i];
					objects[i] = objects[i-1];
					objects[i-1] = temp;
					selectIndex(selectedIndex-1);
				}
			}
			else if (order == "back") {
				temp = objects[i];
				objects.splice(i,1);
				objects.splice(0,0,temp);
				selectIndex(0);
			}
			else if (order == "front") {
				temp = objects[i];
				objects.splice(i,1);
				objects.push(temp);
				selectIndex(objects.length-1);
			}
			Ptero.Pinboard.loader.backup();
		}
	}

	function removeSelectedObject() {
		if (selectedIndex != null) {
			var obj = objects[selectedIndex];
			var i = selectedIndex;
			objects.splice(selectedIndex,1);
			selectIndex(null);
			recordForUndo({
				object: obj,
				undo: function() {
					objects.splice(i, 0, obj);
					selectIndex(i);
				},
				redo: function() {
					objects.splice(i, 1);
					selectIndex(null);
				},
			});
		}
	}

	function duplicateSelectedObject() {
		if (selectedIndex != null) {
			var obj = objects[selectedIndex];
			var b = obj.billboard;
			var obj2 = {
				image:     obj.image,
				imageName: obj.imageName,
				pos:       {x:0, y:0},
				billboard: new Ptero.Billboard(b.centerX, b.centerY, b.w, b.h),
				font:      obj.font,
				textAlign: obj.textAlign,
				text:      obj.text,
			};
			objects.push(obj2);

			var origIndex = selectedIndex;
			var newIndex = objects.length-1;
			selectIndex(newIndex);

			recordForUndo({
				object: obj,
				undo: function() {
					objects.splice(newIndex, 1);
					selectIndex(origIndex);
				},
				redo: function() {
					objects.push(obj2);
					selectIndex(newIndex);
				},
			});
		}
	}

	function selectImage(name) {
		if (selectedIndex == null) {
			if (name) {
				var image = Ptero.assets.images[name] || localImages[name].image;
				var obj = {
					image:     image,
					imageName: name,
					billboard: new Ptero.Billboard(0,0,image.width,image.height),
				};
			}
			else {
				var obj = {
					billboard: new Ptero.Billboard(0,0,200,200),
				};
			}
			obj.pos =       {x:0, y:0};
			obj.font =      'whitefont';
			obj.textAlign = 'center';
			obj.text =      '';
			objects.push(obj);

			var origIndex = selectedIndex;
			var newIndex = objects.length-1;
			selectIndex(newIndex);

			recordForUndo({
				object: obj,
				undo: function() {
					objects.splice(newIndex, 1);
					selectIndex(origIndex);
				},
				redo: function() {
					objects.push(obj);
					selectIndex(newIndex);
				},
			});
		}
		else {
			var obj = objects[selectedIndex];
			var origImage = obj.image;
			var newImage;
			if (name) {
				newImage = Ptero.assets.images[name] || localImages[name].image;
				obj.image = newImage;
				obj.imageName = name;
			}
			else {
				newImage = null;
				obj.image = newImage;
				obj.imageName = null;
			}

			recordForUndo({
				object: obj,
				undo: function() {
					obj.image = origImage;
				},
				redo: function() {
					obj.image = newImage;
				},
			});
		}
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


	/******************************************************************************/
	// IMAGE TOUCH OPERATIONS

	var isStiffResizeKey;
	var isSnapKey;
	var isMoveXOnly, isMoveYOnly;
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
					if (!isMoveYOnly) {
						billboard.centerX = wx - windowRect.x;
						pos.x = wx;
					}
					if (!isMoveXOnly) {
						billboard.centerY = wy - windowRect.y;
						pos.y = wy;
					}
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
					if (!isMoveYOnly) {
						pos.x = wx;
					}
					if (!isMoveXOnly) {
						pos.y = wy;
					}
				};
			}
		}

		var origObjState;
		function restoreObjectState(state) {
			var obj = state.object;
			obj.pos.x = state.x;
			obj.pos.y = state.y;
			obj.billboard.centerX = state.centerX;
			obj.billboard.centerY = state.centerY;
			obj.billboard.w = state.w;
			obj.billboard.h = state.h;
		}
		function getObjectState(obj) {
			return {
				object: obj,
				x: obj.pos.x,
				y: obj.pos.y,
				centerX: obj.billboard.centerX,
				centerY: obj.billboard.centerY,
				w: obj.billboard.w,
				h: obj.billboard.h,
			};
		}
		function areObjectStatesEqual(a,b) {
			var key;
			for (key in a) {
				if (a[key] != b[key]) {
					return false;
				}
			}
			return true;
		}

		return {
			coord: "canvas",
			start: function(cx,cy) {

				moveFunc = null;
				var i,len=objects.length;
				var f,obj;

				// if an object is already selected
				if (selectedIndex != null) {

					// select the frontmost object if the cursor is above one that is in front of the selected object.
					for (i=selectedIndex+1; i<len; i++) {
						f = getMoveImageFunc(objects[i],cx,cy);
						if (f) {
							moveFunc = f;
							selectIndex(i);
						}
					}

					// if there is no object obstructing the cursor from the selected object, proceed with usual control
					if (!moveFunc) {
						obj = objects[selectedIndex];
						moveFunc = getMoveAnchorFunc(obj,cx,cy) || getResizeFunc(obj,cx,cy) || getMoveImageFunc(obj,cx,cy);
					}
				}

				// if no move function has been created
				if (!moveFunc) {

					// deselect
					selectIndex(null);

					// find the topmost object under the cursor
					for (i=0; i<len; i++) {
						obj = objects[i];
						f = getMoveImageFunc(obj,cx,cy);
						if (f) {
							moveFunc = f;
							selectIndex(i);
						}
					}
				}

				// if an object is selected, save its state for redo/undo support
				if (selectedIndex != null) {
					origObjState = getObjectState(objects[selectedIndex]);
				}
				else {
					origObjState = null;
				}
			},
			move: function(cx,cy) {
				var w = Ptero.screen.canvasToWindow(cx,cy);
				moveFunc && moveFunc(w.x,w.y);
			},
			end: function(cx,cy) {
				if (origObjState) {
					var obj = origObjState.object;
					var origState = origObjState;
					var newState = getObjectState(obj);
					if (!areObjectStatesEqual(origState, newState)) {
						recordForUndo({
							object: obj,
							undo: function() {
								restoreObjectState(origState);
							},
							redo: function() {
								restoreObjectState(newState);
							},
						});
					}
				}
				moveFunc = null;
			},
			cancel: function(cx,cy) {
				this.end(cx,cy);
			},
		};
	})();

	/******************************************************************************/
	// CAMERA TOUCH OPERATIONS

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
					var maxScale = Ptero.screen.getWindowFitScale() * 2;
					var minScale = maxScale / 8;
					scale = Math.max(minScale, Math.min(maxScale, scale));

					Ptero.screen.zoomWindow(scale, cx, cy);
				}
			},
		};
	})();

	/******************************************************************************/
	// MAIN INPUT

	var isPreviewKey;
	function enableKeys() {
		window.addEventListener("keydown", function(e) {
			if (e.keyCode == 18) { // alt
				isZoomPanKey = true;
			}
			else if (e.keyCode == 16) { // shift
				isStiffResizeKey = true;
				isSnapKey = true;
			}
			else if (e.keyCode == 80) { // "P"
				isPreviewKey = true;
			}
			else if (e.keyCode == 88) { // "X"
				isMoveXOnly = true;
			}
			else if (e.keyCode == 89) { // "Y"
				isMoveYOnly = true;
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
			else if (e.keyCode == 80) {
				isPreviewKey = false;
			}
			else if (e.keyCode == 88) { // "X"
				isMoveXOnly = false;
			}
			else if (e.keyCode == 89) { // "Y"
				isMoveYOnly = false;
			}
		});
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

	/******************************************************************************/
	// MAIN INPUT

	function init() {

		resetState();

		// init input
		enableKeys();
		enableTouch();
	}

	function draw(ctx) {
		ctx.save();
		Ptero.screen.transformToWindow();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 10;
		ctx.strokeRect(0,0,Ptero.screen.getWindowWidth(),Ptero.screen.getWindowHeight());
		ctx.save();
		Ptero.screen.clipWindow();
		Ptero.deferredSprites.draw(ctx);
		ctx.restore();

		// TODO: draw images in depth order here
		var i,len=objects.length;
		for (i=0; i<len; i++) {
			var obj = objects[i];
			var pos       = obj.pos;
			var billboard = obj.billboard;
			if (obj.image) {
				Ptero.painter.drawImage(ctx,obj.image,pos,billboard);
			}
			if (obj.text) {
				font = Ptero.assets.fonts[obj.font];
				font.draw(ctx, obj.text, billboard, pos, obj.textAlign);
			}

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
				ctx.strokeStyle = "#FF0";
				ctx.beginPath();
				ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
				ctx.fill();
				ctx.stroke();
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
		selectImage: selectImage,

		removeSelectedObject: removeSelectedObject,
		duplicateSelectedObject: duplicateSelectedObject,
		orderSelectedObject: orderSelectedObject,
		renameSelectedObject: renameSelectedObject,

		setSelectedTextAlign: setSelectedTextAlign,
		setSelectedFont: setSelectedFont,
		updateSelectedText: updateSelectedText,

		addNewImage: addNewImage,

		getState: getState,
		setState: setState,
		resetState: resetState,

		undo: undo,
		redo: redo,
	};
})();
