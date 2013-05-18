var Database = require('../db/Database');

module.exports = SequenceSoundSet;

function SequenceSoundSet(id, user_id, name, created, updated, options) {
	this.id = id;
	this.user_id = user_id;
	this.name = name;
	this.created = created;
	this.updated = updated;
	this.options = options;
}

SequenceSoundSet.fromObject = function(obj) {
	return new SequenceSoundSet(obj.id, obj.user_id, obj.name, obj.created, obj.updated, obj.options);
}

SequenceSoundSet.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence_sound_set',
	primary: 'id',
	autoIncrement: 'id'
});
