var Sequence = require('./Sequence');

module.exports = Store;

function Store() {
	this.sequences = {};
}

Store.prototype.addRawSequences = function(sequences, timestamp) {
	sequences.forEach(function(element){
		if(this.sequences.hasOwnProperty(element.content))
			this.sequences[element].last_seen = timestamp;
		else {
			this.sequences[element] = new Sequence(null, element, timestamp);
		}
	}, this);
};