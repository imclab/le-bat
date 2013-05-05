var Database = require('../Database');

module.exports = TagSoundMapping;

function TagSoundMapping(id, tag_id, sound_id, user_id) {
	this.id = id;
	this.tag_id = tag_id;
	this.sound_id = sound_id;
	this.user_id = user_id;
}

TagSoundMapping.fromObject = function(obj) {
	return new TagSoundMapping(obj.id, obj.tag_id, obj.sound_id, obj.user_id);
}

TagSoundMapping.ModelInfo = new Database.ModelInfo({
	tableName: 'tag_sound',
	primary: 'id',
	autoIncrement: 'id'
});
