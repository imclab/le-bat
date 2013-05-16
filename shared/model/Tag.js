var Database = require('../db/Database');

module.exports = Tag;

function Tag(id, name) {
	this.id = id;
	this.name = name
}

Tag.fromObject = function(obj) {
	return new Tag(obj.id, obj.name);
}

Tag.ModelInfo = new Database.ModelInfo({
	tableName: 'tag',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'name'
});
