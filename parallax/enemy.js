
Ptero.Enemy = function() {
};

Ptero.Enemy.fromState = function(state, startTime) {

	startTime = startTime || 0;

	var enemyType = state.enemyType;

	var enemy = new Ptero.Enemy();
	enemy.setType(enemyType);

	var points = state.points;
	var delta_times = [points[0].t + startTime];

	var i,len=points.length;
	for (i=1; i<len; i++) {
		delta_times.push(points[i].t - points[i-1].t);
	}
	enemy.path = enemy.attackPath = new Ptero.Path(
		Ptero.makeHermiteInterpForObjs(
			points,
			['x','y','z','angle'],
			delta_times));

	return enemy;
};

Ptero.Enemy.prototype = {
	makeAnimSprite: function(name) {
		var sprite = Ptero.assets.makeAnimSprite(name);
		sprite.shuffleTime();
		this.startTime = sprite.time;
		return sprite;
	},
	setType: function(type) {
		this.sprite = this.makeAnimSprite(type);
	},
	getPosition: function getPosition() {
		return this.path.pos;
	},
	getFuturePosition: function getFuturePosition(time) {
		return this.path.seek(time);
	},
	getTimeLeftInPath: function() {
		return this.path.totalTime - this.path.time;
	},
	getBillboard: function() {
		return this.sprite.getBillboard();
	},
	init: function() {
	},
	update: function update(dt) {
		this.path.step(dt);
		this.sprite.update(dt);
	},
	draw: function draw(ctx) {
		var pos = this.path.pos;

		if (!this.path.isDone()) {
			this.sprite.draw(ctx, pos);
		}
	},
	setTime: function(t) {
		this.path.setTime(t);
		this.sprite.setTime(this.startTime+t);
	},
};
