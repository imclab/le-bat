var Database = require('../server/lib/Database');

module.exports = Profile;

function Profile(id, user_id, name, created) {
	this.id = id;
	this.user_id = user_id;
	this.name = name;
	this.created = created;
}

Profile.fromObject = function(obj) {
	return new Profile(obj.id, obj.user_id, obj.name, obj.created);
}

Profile.ModelInfo = new Database.ModelInfo({
	tableName: 'profile',
	primary: 'id',
	autoIncrement: 'id'
});
