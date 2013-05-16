var Database = require('../db/Database');

module.exports = Sequence;

function Sequence(id, content, last_update, total_count, blocked) {
	this.id = id;
	this.content = content;
	this.last_update = last_update;
	this.total_count = total_count;
	this.blocked = blocked;
}

Sequence.fromObject = function(obj) {
	return new Sequence(obj.id, obj.content, obj.last_update, obj.total_count, obj.blocked);
}

Sequence.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'content'
});
