
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

	function deferBullets() {
		var i,b;
		for (i=0; i<max_bullets; i++) {
			b = bullets[i];
			if (b) {
				Ptero.deferredSprites.defer(
					(function(b){
						return function(ctx) {
							b.draw(ctx);
						};
					})(b),
					b.pos.z);
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
		deferBullets: deferBullets,
		clear: clear,
	};
})();
