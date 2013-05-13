var Database = require('../server/lib/Database');

module.exports = SequenceSoundSet;

function SequenceSoundSet(id, user_id, name, created, updated) {
	this.id = id;
	this.user_id = user_id;
	this.name = name;
	this.created = created;
	this.updated = updated;
}

SequenceSoundSet.fromObject = function(obj) {
	return new SequenceSoundSet(obj.id, obj.user_id, obj.name, obj.created, obj.updated);
}

SequenceSoundSet.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence_sound_set',
	primary: 'id',
	autoIncrement: 'id'
});
