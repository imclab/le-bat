var vows = require('vows')
	, assert = require('assert')
	, Sequence = require('../server/lib/sequence/Sequence')
	, Matcher = require('../server/lib/sequence/Matcher')
	, Splitter = require('../server/lib/sequence/Splitter')


vows.describe('string').addBatch({
	'Splitter tests': {
		topic: {
			text: "  This!! simple - text's @fd31 (3) a-plus` $100 #matcher a_c. "
		}
		, 'raw sequence count based on spaces' : function(topic) {
			var splitter = new Splitter({ ignore: [] });
			assert.equal(splitter.split(topic.text).length, 10);
		}
		, 'sequence count without usernames' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames'] });
			assert.equal(splitter.split(topic.text).length, 9);
		}
		, 'sequence count without usernames and hashtags' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames', 'hashtags'] });
			assert.equal(splitter.split(topic.text).length, 8);
		}
		, 'sequence count without punctuation' : function(topic) {
			var splitter = new Splitter({ ignore: ['punctuation'] });
			var sequences = splitter.split(topic.text);

			assert.equal(sequences.length, 12);
			assert.equal(sequences[0], 'This');
			assert.equal(sequences[2], 'text');
			assert.equal(sequences[8], '$100');
		}
		, 'sequence count without punctuation, usernames and hashtags' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames', 'hashtags', 'punctuation'] });
			assert.equal(splitter.split(topic.text).length, 10);
		}
	}
	, 'Matcher tests': {
		topic : function() {
			return { 
				sequences: ["twitt", "twitter", "witt", "itter", "error"]
				, text: "twitter wittnesses terror" 
			};
		}
		, 'searching for raw sequences in plain trie': function (topic) {
			var matcher = new Matcher();
			topic.sequences.forEach(function(element) { matcher._addRawSequence(element) });
			var result = matcher.search(topic.text);
			assert.equal(result.length, 2); // twitter, witt
		}
		, 'searching for raw sequences with suffix links': function (topic) {
			var matcher = new Matcher();
			topic.sequences.forEach(function(element) { matcher._addRawSequence(element) });
			matcher._updateLinks();
			var result = matcher.search(topic.text);
			assert.equal(result.length, 6, "Not enough matches in this Aho-Corasick implementation"); // twitt, witt, twitter, itter, witt, error
		}
	}
	, 'Store tests': {
		topic: function() {
			return {};
		}
		, 'empty' : function(topic) {

		}
	}
}).export(module);