
Ptero.bulletpool = (function(){
	var bullets = [];
	var max_bullets = 100;

	function getFreeIndex() {
		var i;
		for (i=0; i<max_bullets; i++) {
			if (!bullets[i]) {
				return i;
			}
		}
		return -1;
	};

	function add(bullet) {
		var i = getFreeIndex();
		if (i != -1) {
			bullets[i] = bullet;
		}
	};

	function update(dt) {
		var i,b;
		var frustum = Ptero.screen.getFrustum();
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (!b) {
				continue;
			}
			b.update(dt);
			if (!frustum.isInside(b.pos)) {
				delete bullets[i]; 
				continue;
			}
			if (b.target && b.time > b.collideTime) {
				b.target.onHit && b.target.onHit();
				delete bullets[i];
			}
		}
	};

	function draw(ctx) {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			b && b.draw(ctx);
		}
	};

	function clear() {
		var i;
		for (i=0; i<max_bullets; i++) {
			delete bullets[i];
		}
	};

	return {
		add: add,
		update: update,
		draw: draw,
		clear: clear,
	};
})();
