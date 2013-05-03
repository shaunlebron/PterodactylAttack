
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
			if (b.collideTarget && !b.collideTarget.isHittable()) {
				b.collideTarget = undefined;
			}
			b.update(dt);
			if (b.isDone()) {
				if (b.collideTarget && b.collideTarget.onHit) {
					b.collideTarget.onHit();
				}
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
	}

	function deferBullets() {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (b) {
				var pos = b.getPosition();
				if (pos) {
					Ptero.deferredSprites.defer(
						(function(b){
							return function(ctx) {
								b.draw(ctx);
							};
						})(b),
						pos.z);
				}
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
		deferBullets: deferBullets,
		clear: clear,
		bullets: bullets,
	};
})();
