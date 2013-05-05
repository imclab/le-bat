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
					} else {
						console.log("Database up and running fine.");
						self._onReady();
					}
				}
			})
		}
	});
}


Database.prototype.getAll = function(modelInfo, options, callback) {
	if(!(modelInfo instanceof Database.ModelInfo)) {
		this.emit('error', 'Please provide a valid Database.ModelInfo');
		return;
	}
	var self = this;
	var query = 'SELECT * FROM ' + mysql.escapeId(modelInfo.tableName);
	if(options) query += ' ' + this._convertQueryOptions(opions);
	this.connection.query(query, function(err, result) {
		if(err){ self.emit('error', err); return; }
		callback.call(self, err, result);
	});
}


Database.prototype.setAll = function(modelInfo, objects, callback) {
	if(!(modelInfo instanceof Database.ModelInfo)) {
		this.emit('error', 'Please provide a valid Database.ModelInfo');
		return;
	}
	if(objects.length == 0) return;
	var self = this;
	var columns = _.keys(objects[0]);
	
	var insertColumnsDef = '(' + _.map(columns, function(name) { return mysql.escapeId(name) }).join(',') + ')';
	var onDuplicateDef = _.map(_.without(columns, modelInfo.unique), function(name) { return mysql.escapeId(name)+'=VALUES('+mysql.escapeId(name)+')'}).join(',');
	
	var values = [];
	_.values(objects).forEach(function(obj) {
		values.push('(' + _.map(_.values(obj), function(value) { return mysql.escape(value) }).join(',') + ')');
	});

	var query = 'INSERT INTO ' + mysql.escapeId(modelInfo.tableName) + ' ' + insertColumnsDef + ' VALUES ' + values.join(',') +
		' ON DUPLICATE KEY UPDATE ' + onDuplicateDef;
	//console.log(query);
	
	this.connection.query(query, function(err, result) {
		callback.call(this, err, result);
		if(err){ self.emit('error', err); return; }
		var useStrint = typeof result.insertId == 'string';
		// insert id for multiple rows returns FIRST inserted id
		// see http://dba.stackexchange.com/questions/21181/is-mysqls-last-insert-id-function-guaranteed-to-be-correct
		for(var i=0, n=objects.length; i<n; ++i) 
			if(objects[i][modelInfo.autoIncrement] == null) objects[i][modelInfo.autoIncrement] = result.insertId++;
	});
}


Database.prototype._validateOperator = function(op) {
	switch(op.toLowerCase()){
		case '<':
		case '<=':
		case '>':
		case '>=':
		case '=':
		case '<>':
		case 'and':
		case 'or': 
			return op;
		default: 
			return false;
	}
}


Database.prototype._convertQueryOptions = function(options) {
	var where = [],
		order = [],
		limit = [],
		result = [];
	for(var n in options) {
		switch(n.toLowerCase()) {
		case 'where':
			var str = '';
			options.where.forEach(function(element) {
				if(typeof element == 'string')
					str += this._validateOperator(element);
				else {
					str += mysql.escapeId(element.col);
					str += element.op ? this._validateOperator(element.op) : '=';
					str += mysql.escape(element.val);
				}
				where.push(str);
			}, this);
			break;
		case 'order': 
			var str = '';
			options.order.forEach(function(element) {
				var isExpression = element.hasOwnProperty('exp');
				if(isExpression) str += element.exp + '(';
				str += element.hasOwnElement('col') ? mysql.escapeId(element.col) : '';
				if(isExpression) str += ')';
				str += element.desc ? ' DESC' : ' ASC';
			}, this);
			break;
		case 'limit': 
			if(options.limit.hasOwnProperty('offset')) limit.push(options.limit.offset);
			if(options.limit.hasOwnProperty('count')) limit.push(options.limit.count);
			break;
		}
	}
	if(where.length) result.push(where.join(' '));
	if(where.order) result.push(order.join(', '));
	if(where.limit) result.push(limit.join(', '));
	return result.join(' ');
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
		console.error('Database connection error', err);
		self.emit('error', err);
	})
	self.on('ready', function() {
		process.on('exit', function() {
			self.shutdown();
		})
	})
} 



/******************************************************************************
 * Class template for usage in database queries, describing table constraints
 *****************************************************************************/

Database.ModelInfo = function(options) {
	this.tableName = options.tableName;
	this.autoIncrement = options.autoIncrement;
	this.primary = options.primary;
	this.unique = [].concat(options.unique);
}
