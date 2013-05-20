var mysql = require('mysql')
	, fs = require('fs')
	, util = require('util')
	, events = require('events')
	, os = require('os')
	, _ = require('underscore')
	, strint = require("../lib/strint/strint")
	, pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

module.exports = Database;


function Database(options) {
	if(!options.mysql) this.emit('error', 'Missing MySQL configuration.')
	this.options = _.defaults(options.mysql, { supportBigNumbers: true });
	this.ready = false;
	this.connection = mysql.createConnection(this.options);
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
		} else {
			self.connection.query('SELECT value FROM var WHERE name = ?', ['schema_version'], function(err, result) {
				if(err) self.emit('error', err);
				else if(result.length == 0) {
					console.log("Missing schema version.");
					self._installSchema();
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


Database.prototype.getVars = function(names, callback) {
	var self = this;
	var options = {where:[]};
	if(typeof names === 'string') names = [names];
	names.forEach(function(name) {
		options.where.push({ col: 'name', val: name });
		options.where.push('or');
	});
	options.where.pop();
	this.getAll(Database.Var.ModelInfo, options, callback);
}


Database.prototype.setVars = function(obj, callback) {
	var vars = [];
	for(var name in obj) vars.push({ name: name, value: obj[name] });
	this.setAll(Database.Var.ModelInfo, vars, callback);
}


Database.prototype.getAll = function(modelInfo, options, callback) {
	if(!(modelInfo instanceof Database.ModelInfo)) {
		this.emit('error', 'Please provide a valid Database.ModelInfo');
		return;
	}
	var self = this;
	var query = 'SELECT * FROM ' + mysql.escapeId(modelInfo.tableName);
	if(options) query += ' ' + this._convertQueryOptions(options);
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

	var onDuplicateSafeColumns = []; 
	columns.forEach(function(col){ if(col != modelInfo.autoIncrement && !_.contains(modelInfo.unique, col)) onDuplicateSafeColumns.push(col); });
	var onDuplicateDef = _.map(onDuplicateSafeColumns, function(name) { return mysql.escapeId(name)+'=VALUES('+mysql.escapeId(name)+')'}).join(',');
	
	var values = [];
	_.values(objects).forEach(function(obj) {
		values.push('(' + _.map(_.values(obj), function(value) { return mysql.escape(value) }).join(',') + ')');
	});

	var query = 'INSERT INTO ' + mysql.escapeId(modelInfo.tableName) + ' ' + insertColumnsDef + ' VALUES ' + values.join(',');
	if(onDuplicateDef)
		query += ' ON DUPLICATE KEY UPDATE ' + onDuplicateDef;
	// console.log(query);
	
	this.connection.query(query, function(err, result) {
		if(err){ self.emit('error', err); return; }
		// We use strint if the auto incremented is be too big
		var useStrint = typeof result.insertId == 'string' || result.insertId + result.affectedRows == Infinity;
		// insert id for multiple rows returns FIRST inserted id
		// see http://dba.stackexchange.com/questions/21181/is-mysqls-last-insert-id-function-guaranteed-to-be-correct
		for(var i=0, n=objects.length; i<n; ++i) 
			if(objects[i][modelInfo.autoIncrement] == null) 
				objects[i][modelInfo.autoIncrement] = useStrint ? result.insertId = strint.add(''+result.insertId, '1') : result.insertId++;
		if(callback) 
			callback.call(this, err, result);
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
		case '(':
		case ')':
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
			options.where.forEach(function(element) {
				var str = '';
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
			options.order.forEach(function(element) {
				var str = '';
				var isExpression = element.hasOwnProperty('exp');
				if(isExpression) str += element.exp + '(';
				str += element.hasOwnProperty('col') ? mysql.escapeId(element.col) : '';
				if(isExpression) str += ')';
				str += element.desc ? ' DESC' : ' ASC';
				order.push(str);
			}, this);
			break;
		case 'limit': 
			if(options.limit.hasOwnProperty('offset')) limit.push(options.limit.offset);
			if(options.limit.hasOwnProperty('count')) limit.push(options.limit.count);
			break;
		}
	}
	if(where.length) result.push('WHERE ' + where.join(' '));
	if(order.length) result.push('ORDER BY ' + order.join(', '));
	if(limit.length) result.push('LIMIT ' + limit.join(', '));
	return result.join(' ');
}


Database.prototype._installSchema = function() {
	console.log("Installing schema.")
	var self = this;
	var installerConnection = mysql.createConnection(
		require('underscore').defaults(this.options, { multipleStatements: true })
	);
	var schema = fs.readFileSync('shared/model/schema.sql');
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


Database.prototype._reconnect = function() {
	console.log('Reconnecting database.');
	this.connection = mysql.createConnection(this.connection.config);
	this._registerEvents()
	this.connection.connect();
}

Database.prototype._registerEvents = function(){
	var self = this;
	this.connection.on('error', function(err) {
		console.error('Database connection error', err);
		
		if (!err.fatal) 
			return;

		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.log('Lost database connection:', err.stack);
			self._reconnect();
			return;
		}
		
		return self.emit('error', err);
	});

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


Database.Var = function(name, value) {
	this.name = name;
	this.value = value;
}

Database.Var.ModelInfo = new Database.ModelInfo({
	tableName: 'var',
	primary: 'name',
	unique: 'name'
})
