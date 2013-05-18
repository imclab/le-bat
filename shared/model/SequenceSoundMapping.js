var Database = require('../db/Database');

module.exports = SequenceSoundMapping;

function SequenceSoundMapping(id, sequence_id, sound_id, set_id, options) {
	this.id = id;
	this.sequence_id = sequence_id;
	this.sound_id = sound_id;
	this.set_id = set_id;
	this.options = options
}

SequenceSoundMapping.fromObject = function(obj) {
	return new SequenceSoundMapping(obj.id, obj.sequence_id, obj.sound_id, obj.set_id, obj.options);
}

SequenceSoundMapping.ModelInfo = new Database.ModelInfo({
	tableName: 'sequence_sound',
	primary: 'id',
	autoIncrement: 'id'
});
