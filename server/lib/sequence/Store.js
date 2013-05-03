var Sequence = require('./Sequence')
,	Splitter = require('./Splitter')
,	_ = require('underscore')

module.exports = Store;

function Store() {
	this.splitter = new Splitter({ignore: ['usernames', 'urls', 'punctuation', 'single_letters']});

	this.sequences = {};

	this.localUpdates = {};
	this.lastLocalUpdate = 0;

	this.db = null;
	this.lastDbSave = 0;
	this.lastDbPull = 0;
}


Store.prototype.setDb = function(db) {
	this.db = db;
	var self = this;
	this.db.on('ready', function() { 
		self.pullDb(); 
	});
	setInterval(function() {
		self.updateDb();
	}, 5000);
}


Store.prototype.pullDb = function() {
	var self = this;
	if(this.db && this.db.ready) 
		this.db.getAll('sequence', null, function(err, result){
			if(err) return;
			result.forEach(function(element) {
				self.sequences[element.content] = Sequence.fromObject(element);
			});
			self.lastDbPull = Date.now();
		});
}


Store.prototype.updateDb = function() {
	var self = this;
	var shouldUpdate = false;
	for(var n in this.localUpdates) { shouldUpdate = true; break; }
	if(this.db && this.db.ready && shouldUpdate) 
		this.db.setAll('sequence', _.values(this.localUpdates), function(err, result) {
			if(err) return;
			self.localUpdates = {};
			self.lastDbSave = Date.now();
		});
}

Store.prototype.parseText = function(text, timestamp) {
	this.addRawSequences(this.splitter.split(text.toLowerCase()), timestamp);
	this.lastLocalUpdate = timestamp;
}


Store.prototype.addRawSequences = function(sequences, timestamp) {
	sequences.forEach(function(element){
		if(this.sequences.hasOwnProperty(element)) {
			this.sequences[element].last_update = timestamp;
			this.sequences[element].total_count++;
			this.localUpdates[element] = this.sequences[element];
		} else {
			this.sequences[element] = new Sequence(null, element, timestamp, 1, false);
			this.localUpdates[element] = this.sequences[element];
		}
	}, this);
};

