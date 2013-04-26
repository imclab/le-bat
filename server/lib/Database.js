var mysql = require('mysql')
	, fs = require('fs')
	, util = require('util')
	, events = require('events')
	, os = require('os')
	, pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

module.exports = Database;


function Database(options) {
	if(!options.mysql) this.emit('error', 'Missing MySQL configuration.')
	this.options = options;
	this.ready = false;
	this.connection = mysql.createConnection(options.mysql);
	this._registerEvents();
}
util.inherits(Database, events.EventEmitter);


Database.prototype.init = function() {
	var self = this;
	this.connection.connect();
	this.connection.query('SHOW TABLES LIKE "var"', function(err, result) {
		if(err) self.emit('error', err);
		else if(result.length == 0) {
			console.log("Database tables not found.");
			self._installSchema();
			self.connection.end();
		} else {
			self.connection.query('SELECT value FROM var WHERE name = ?', ['schema_version'], function(err, result) {
				if(err) self.emit('error', err);
				else if(result.length == 0) {
					console.log("Missing schema version.");
					self._installSchema();
					self.connection.end();
				} else {
					if(result[0].value < pjson.dbSchemaVersion) {
						self.emit('error', 'Database schema mismatch, please update from repository.' + os.EOL
							+ 'Running version:' + result[0].value + os.EOL
							+ 'Needed version: ' + pjson.dbSchemaVersion);
						self.connection.end();
					}
					console.log("Database up and running fine.");
					self.emit('ready');
				}
			})
		}
	});
}


Database.prototype._installSchema = function() {
	console.log("Installing schema.")
	var self = this;
	var installerConnection = mysql.createConnection(
		require('underscore').defaults(this.options.mysql, { multipleStatements: true })
	);
	var schema = fs.readFileSync('server/schema.sql');
	installerConnection.query(schema.toString('utf8'), function(err, result) {
		if(err) self.emit('error', err);
		else console.log("Schema installation complete. Setting version.");
	});
	installerConnection.query('INSERT INTO var SET ?', { name: 'schema_version', value: pjson.dbSchemaVersion }, function(err, result) {
		if(err) self.emit('error', err);
		else self.emit('ready');
	});
	installerConnection.end();
}


Database.prototype._registerEvents = function(){
	var self = this;
	this.connection.on('error', function(err) {
		console.error('Database connection error');
		self.emit('error', err);
	})
	self.on('ready', function() {
		this.ready = true;
	})
} 