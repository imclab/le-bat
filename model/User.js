var Database = require('../backend/lib/Database');

module.exports = User;

function User(id, auth_type, name, pass, salt, created) {
	this.id = id;
	this.auth_type = auth_type;
	this.name = name;
	this.pass = pass;
	this.salt = salt;
	this.created = created;
}

User.fromObject = function(obj) {
	return new User(obj.id, obj.auth_type, obj.name, obj.pass, obj.salt, obj.created);
}

User.strippedFromObject = function(obj){
	return new User(obj.id,null,obj.name,null,null,null);
}

User.ModelInfo = new Database.ModelInfo({
	tableName: 'user',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'name'
});
