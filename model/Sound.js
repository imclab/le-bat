var Database = require('../server/lib/Database');

module.exports = Sound;

function Sound(id, name, sha1, file_path, source, license, author) {
	this.id = id;
	this.name = name;
	this.sha1 = sha1;
	this.file_path = file_path;
	this.source = source;
	this.license = license;
	this.author = author;
}

Sound.fromObject = function(obj) {
	return new Sound(obj.id, obj.name, obj.sha1, obj.file_path, obj.source, obj.license, obj.author);
}

Sound.ModelInfo = new Database.ModelInfo({
	tableName: 'sound',
	primary: 'id',
	autoIncrement: 'id',
	unique: 'sha1'
});
