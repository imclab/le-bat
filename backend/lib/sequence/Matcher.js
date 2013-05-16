var _ = require('underscore')
	, Sequence = require('../../../shared/model/Sequence')
	, AhoCorasick = require('./AhoCorasick')
	, Trie = require('./Trie')

module.exports = Matcher;


function Matcher(options) {
	switch(options.algorithm) {
		case 'aho-corasick': 
			this.trie = new AhoCorasick();
			break;
		case 'trie':
		default:
			this.trie = new Trie();
	};
	this.maxInsertSize = 500;
}


Matcher.prototype.addSequences = function(sequenceObjects) {
	var self = this;
	var n = sequenceObjects.length;
	if(n < this.maxInsertSize) {
		
		sequenceObjects.forEach(function(sequence) {
			this.addSequence(sequence);
		}, this);

	} else {
		// Incremental Aho-Corasick needs to be broken up into work packages.
		var offset = 0;
		var worker = setInterval(function(){
			for(var i = 0; offset<n && i<self.maxInsertSize; i++, offset++)
				self.addSequence(sequenceObjects[offset]);
			if(offset == n){
				clearInterval(worker);
				console.log('complete!');
			}
		}, 50);

		var reporter = setInterval(function() {
			if(offset == n) clearInterval(reporter);
			else console.log(Math.round(100*offset/n) + '%');
		}, 3000);
	}
	
}


Matcher.prototype.search = function(text) {
	var result = [];
	result = this.trie.search(text);
	return result;
}


Matcher.prototype.addSequence = function(sequence, data) {
	this.trie.add(sequence.content, data ? data : sequence);
}
