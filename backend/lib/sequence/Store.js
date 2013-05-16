var Sequence = require('../../../shared/model/Sequence')
,	Splitter = require('./Splitter')
,	Matcher = require('./Matcher')
,	_ = require('underscore')

module.exports = Store;

function Store() {
	this.splitter = new Splitter({ignore: ['usernames', 'urls', 'punctuation', 'single_letters']});

	this.sequences = {};
	this.matcher = new Matcher({algorithm: 'aho-corasick'});

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
		this.db.getAll(Sequence.ModelInfo, {where: [{col: 'total_count', op: '>', val: 1}] }, function(err, result){
			if(err) return;
			result.forEach(function(element) {
				self.sequences[element.content] = Sequence.fromObject(element);
			});
			self.matcher.addSequences(result);
			self.lastDbPull = Date.now();
		});
}


Store.prototype.updateDb = function() {
	var self = this;
	var shouldUpdate = false;
	for(var n in this.localUpdates) { shouldUpdate = true; break; }
	if(this.db && this.db.ready && shouldUpdate) 
		this.db.setAll(Sequence.ModelInfo, _.values(this.localUpdates), function(err, result) {
			if(err) return;
			self.localUpdates = {};
			self.lastDbSave = Date.now();
		});
}

Store.prototype.parseText = function(text, timestamp) {
	if(typeof text != 'string') return;
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
			this.matcher.addSequence(this.sequences[element]);
			this.localUpdates[element] = this.sequences[element];
		}
	}, this);
};
