var Sequence = require('./Sequence')
,	Splitter = require('./Splitter')

module.exports = Store;

function Store() {
	this.splitter = new Splitter({ignore: ['usernames', 'punctuation']});
	this.sequences = {};
	this.rawSequences = {};
}


Store.prototype.parseText = function(text, timestamp) {
	this.addRawSequences(this.splitter.split(text), timestamp);
}


Store.prototype.addRawSequences = function(sequences, timestamp) {
	sequences.forEach(function(element){
		if(this.sequences.hasOwnProperty(element)) {
			// this.sequences[element].last_seen = timestamp;
			this.sequences[element].total_count++;
		} else {
			this.sequences[element] = new Sequence(null, element, 1, false, timestamp);
		}
	}, this);
};

