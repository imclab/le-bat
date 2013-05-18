var Sequence = require('../../../shared/model/Sequence')
,	Database = require('../../../shared/db/Database')
,	Splitter = require('./Splitter')
,	Matcher = require('./Matcher')
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

	this.processedTexts = 0;

	this.matcher = new Matcher({algorithm: 'aho-corasick'});
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
	if(this.db && this.db.ready) {
		
		this.db.getVars(['processed_texts'], function(err, result) {
			if(err) return;
			if(result.length) self.processedTexts = parseInt(result[0].value);
		});

		this.db.getAll(Sequence.ModelInfo, {where: [{col: 'split_count', op: '>', val: 1}] }, function(err, result){
			if(err) return;
			result.forEach(function(element) {
				self.sequences[element.content] = Sequence.fromObject(element);
			});
			self.lastDbPull = Date.now();

			console.log('Adding ' + result.length + ' sequences to Store-Matcher:');
			self.matcher.addSequences(result);
		});
	}
}


Store.prototype.updateDb = function() {
	var self = this;
	var shouldUpdate = false;
	for(var n in this.localUpdates) { shouldUpdate = true; break; }
	if(this.db && this.db.ready && shouldUpdate) {
		this.db.setAll(Sequence.ModelInfo, _.values(this.localUpdates), function(err, result) {
			if(err) return;
			self.localUpdates = {};
			self.lastDbSave = Date.now();
		});
		this.db.setVars({ processed_texts: this.processedTexts });
	} 
}

Store.prototype.parseText = function(text, timestamp) {
	if(typeof text != 'string' && !text) return;
	
	// Do the splitting and add the result to the Store
	this._addRawSequences(this.splitter.split(text.toLowerCase()), timestamp);
	
	// Search in our Trie and record the match count
	this._updateMatchCounts(this.matcher.search(text), timestamp);

	// For the stats
	this.processedTexts++;
	this.lastLocalUpdate = timestamp;
}


Store.prototype._updateMatchCounts = function(matches, timestamp) {
	if(!matches.length) return;
	matches.forEach(function(match) {
		var sequence = match.data;
		sequence.match_count++; // watch out for string if too big: use strint
		sequence.last_update = timestamp;
		if(sequence.split_count > 1)
			this.localUpdates[match.sequence] = sequence; 
	}, this);
}


Store.prototype._addRawSequences = function(sequences, timestamp) {
	sequences.forEach(function(element){
		if(this.sequences.hasOwnProperty(element)) {
			this.sequences[element].last_update = timestamp;
			this.sequences[element].split_count++;
			this.localUpdates[element] = this.sequences[element];
		} else {
			this.sequences[element] = new Sequence(null, element, timestamp, 1, 0, false);
			// We don't push new sequences (split_count==1) to the database
			// But we add them to the Matcher
			this.matcher.addSequence(this.sequences[element]);
		}
	}, this);
};

