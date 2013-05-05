var Database = require('../Database');

module.exports = SequenceSoundMapping;

function SequenceSoundMapping(id, sequence_id, sound_id, user_id) {
	this.id = id;
	this.sequence_id = sequence_id;
	this.sound_id = sound_id;
	this.user_id = user_id;
}

SequenceSoundMapping.fromObject = function(obj) {
	return new SequenceSoundMapping(obj.id, obj.sequence_id, obj.sound_id, obj.user_id);
}

SequenceSoundMapping.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence_sound',
	primary: 'id',
	autoIncrement: 'id'
});
