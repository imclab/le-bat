var _ = require('underscore')
	, Sequence = require('./Sequence')
	, AhoCorasick = require('aho-corasick.js')

module.exports = Matcher;


function Matcher(options) {
	this.trie = new AhoCorasick.TrieNode();
}


Matcher.prototype.addSequences = function(sequenceObjects) {
	sequenceObjects.forEach(function(element, index) {
		this._addRawSequence(element.content);
	}, this);
	this._updateLinks();
}


Matcher.prototype.search = function(text) {
	var result = [];
	AhoCorasick.search(text, this.trie, function(found_word, data) {
		result.push(found_word);
	});
	return result;
}


Matcher.prototype._addRawSequence = function(sequence) {
	this.trie.add(sequence);
}

Matcher.prototype._updateLinks = function() {
	AhoCorasick.add_suffix_links(this.trie);
}