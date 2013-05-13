var Database = require('../server/lib/Database');

module.exports = User;

function User(id, name, pass, salt, gender, age, created) {
	this.id = id;
	this.name = name;
	this.pass = pass;
	this.salt = salt;
	this.gender = gender;
	this.age = age;
	this.created = created;
}

User.fromObject = function(obj) {
	return new User(obj.id, obj.name, obj.pass, obj.salt, obj.gender, obj.age, obj.created);
}

User.ModelInfo = new Database.ModelInfo({
	tableName: 'user',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'name'
});
