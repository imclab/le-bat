var mysql = require('mysql')
	, fs = require('fs')
	, util = require('util')
	, events = require('events')
	, os = require('os')
	, _ = require('underscore')
	, pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

module.exports = Database;


function Database(options) {
	if(!options.mysql) this.emit('error', 'Missing MySQL configuration.')
	this.options = options;
	this.ready = false;
	this.connection = mysql.createConnection(_.defaults(options.mysql, { supportBigNumbers: true }));
	this._registerEvents();
}
util.inherits(Database, events.EventEmitter);


Database.prototype.getAll = function(tableName) {

}


Database.prototype.setAll = function(tableName, objects) {
	if(objects.length == 0) return;
	var self = this;
	var columnNames = '(' + _.map(_.keys(objects[0]), function(name) { return mysql.escapeId(name) }).join(',') + ')';
	var values = [];
	_.values(objects).forEach(function(obj) {
		values.push('(' + _.map(_.values(obj), function(value) { return mysql.escape(value) }).join(',') + ')');
	});
	// This is a rather bad call, as result.insertId can be a string.
	// A better updating scheme is needed.
	var query = 'REPLACE INTO ' + mysql.escapeId(tableName) + ' ' + columnNames + ' VALUES ' + values.join(',');
	this.connection.query(query, function(err, result) {
		if(err){ self.emit('error', err); return; }
		// insert id for multiple rows returns FIRST inserted id
		// see http://dba.stackexchange.com/questions/21181/is-mysqls-last-insert-id-function-guaranteed-to-be-correct
		for(var i=0, n=objects.length; i<n; ++i) 
			if(objects[i].id == null) objects[i].id = result.insertId++;
		console.log(objects, result);
	});
}


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
					self._onReady();
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
		else self._onReady();
	});
	installerConnection.end();
}


Database.prototype._onReady = function() {
	this.ready = true;
	var err = null;
	var self = this;
	this.connection.query('REPLACE INTO var SET ?', { name: 'last_startup', value: Date.now() });
	this.emit('ready');
}


Database.prototype.shutdown = function() {
	if(!this.ready) return;
	this.connection.query('REPLACE INTO var SET ?', { name: 'last_shutdown', value: Date.now() });
}


Database.prototype._registerEvents = function(){
	var self = this;
	this.connection.on('error', function(err) {
		console.error('Database connection error');
		self.emit('error', err);
	})
	self.on('ready', function() {
		process.on('exit', function() {
			self.shutdown();
		})
	})
} 