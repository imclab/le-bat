module.exports = Sequence;

function Sequence(id, content, total_count, blocked, last_seen) {
	this.id = id;
	this.content = content;
	this.total_count = total_count;
	this.blocked = blocked;
	// this.last_seen = last_seen;
}

Sequence.fromObject = function(obj) {
	return new Sequence(obj.id, obj.content, obj.total_count, obj.blocked, obj.last_seen);
}