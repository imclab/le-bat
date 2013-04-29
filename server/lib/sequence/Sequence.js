module.exports = Sequence;

function Sequence(id, content, last_seen) {
	this.id = id;
	this.content = content;
	this.last_seen = last_seen;
}

Sequence.fromObject = function(obj) {
	return new Sequence(this.id, obj.content, obj.last_seen);
}