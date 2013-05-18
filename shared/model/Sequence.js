var Database = require('../db/Database');

module.exports = Sequence;

function Sequence(id, content, last_update, split_count, match_count, blocked) {
	this.id = id;
	this.content = content;
	this.last_update = last_update;
	this.split_count = split_count;
	this.match_count = match_count;
	this.blocked = blocked;
}

Sequence.fromObject = function(obj) {
	return new Sequence(obj.id, obj.content, obj.last_update, obj.split_count, obj.match_count, obj.blocked);
}

Sequence.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'content'
});
