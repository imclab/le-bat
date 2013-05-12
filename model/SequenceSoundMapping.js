var Database = require('../server/lib/Database');

module.exports = SequenceSoundMapping;

function SequenceSoundMapping(id, sequence_id, sound_id, profile_id) {
	this.id = id;
	this.sequence_id = sequence_id;
	this.sound_id = sound_id;
	this.profile_id = profile_id;
}

SequenceSoundMapping.fromObject = function(obj) {
	return new SequenceSoundMapping(obj.id, obj.sequence_id, obj.sound_id, obj.profile_id);
}

SequenceSoundMapping.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence_sound',
	primary: 'id',
	autoIncrement: 'id'
});
