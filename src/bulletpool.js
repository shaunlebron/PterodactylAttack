
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
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (!b) {
				continue;
			}
			b.update(dt);
			if (b.collideTarget && b.time > b.collideTime) {
				b.collideTarget.onHit && b.collideTarget.onHit();
				bullets[i] = null;
			}
			else if (b.time > b.lifeTime) {
				bullets[i] = null;
			}
		}
	};

	function draw(ctx) {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (b) {
				b.draw(ctx);
			}
		}
	};

	function clear() {
		var i;
		for (i=0; i<max_bullets; i++) {
			bullets[i] = null;
		}
	};

	return {
		add: add,
		update: update,
		draw: draw,
		clear: clear,
	};
})();
