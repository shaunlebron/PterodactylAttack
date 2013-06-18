Ptero.smokepool = (function(){
	var smokes = [];
	var max_smokes = 200;

	function getFreeIndex() {
		var i;
		for (i=0; i<max_smokes; i++) {
			if (!smokes[i]) {
				return i;
			}
		}
		return -1;
	};

	function add(pos) {
		var i = getFreeIndex();
		if (i != -1) {
			smokes[i] = new Ptero.BulletSmoke(pos.copy());
		}
	};

	function update(dt) {
		var i,b;
		for (i=0; i<max_smokes; i++) {
			b = smokes[i];
			if (!b) {
				continue;
			}
			b.update(dt);
			if (b.isDone()) {
				smokes[i] = null;
			}
		}
	};

	function clear() {
		var i;
		for (i=0; i<max_smokes; i++) {
			smokes[i] = null;
		}
	};

	function deferSmokes() {
		var i,b;
		for (i=0; i<max_smokes; i++) {
			b = smokes[i];
			if (b) {
				var pos = b.pos;
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

	return {
		add: add,
		update: update,
		deferSmokes: deferSmokes,
		clear: clear,
		smokes: smokes,
	};
})();

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
					b.collideTarget.onHit(b.damage);
				}
				bullets[i] = null;
			}
		}
		Ptero.smokepool.update(dt);
	};

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
		Ptero.smokepool.deferSmokes();
	};

	function clear() {
		var i;
		for (i=0; i<max_bullets; i++) {
			bullets[i] = null;
		}
		Ptero.smokepool.clear();
	};

	return {
		add: add,
		update: update,
		deferBullets: deferBullets,
		clear: clear,
		bullets: bullets,
	};
})();
