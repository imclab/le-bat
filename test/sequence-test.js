var vows = require('vows')
	, assert = require('assert')
	, Sequence = require('../model/Sequence')
	, Matcher = require('../server/lib/sequence/Matcher')
	, Trie = require('../server/lib/sequence/Trie')
	, AhoCorasick = require('../server/lib/sequence/AhoCorasick')
	, Splitter = require('../server/lib/sequence/Splitter')


vows.describe('string').addBatch({
	'Splitter tests': {
		topic: {
			text: "O  This!! simple - text's @fd31 (3) a-plus` $100 #matcher a_c. http://t.co/83Dsa?asd=0&k www.beta.com "
		}
		, 'raw sequence count based on spaces' : function(topic) {
			var splitter = new Splitter({ ignore: [] });
			assert.equal(splitter.split(topic.text).length, 13);
		}
		, 'sequence count without usernames' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames'] });
			assert.equal(splitter.split(topic.text).length, 12);
		}
		, 'sequence count without usernames and hashtags' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames', 'hashtags'] });
			assert.equal(splitter.split(topic.text).length, 11);
		}
		, 'sequence count without punctuation' : function(topic) {
			var splitter = new Splitter({ ignore: ['punctuation'] });
			var sequences = splitter.split(topic.text);

			assert.equal(sequences.length, 23);
			assert.equal(sequences[1], 'This');
			assert.equal(sequences[3], 'text');
			assert.equal(sequences[9], '$100');
		}
		, 'sequence count without punctuation, usernames and hashtags' : function(topic) {
			var splitter = new Splitter({ ignore: ['usernames', 'hashtags', 'punctuation'] });
			assert.equal(splitter.split(topic.text).length, 21);
		}
		, 'sequence count without urls, punctuation, single letters, usernames and hashtags' : function(topic) {
			var splitter = new Splitter({ ignore: ['urls', 'usernames', 'hashtags', 'punctuation', 'single_letters'] });
			assert.equal(splitter.split(topic.text).length, 6);
		}
	}
	, 'Matcher tests': {
		topic : function() {
			return { 
				sequences: ['twitt', 'twitter', 'witt', 'itter']
				, text: 'twitter' 
			};
		}
		, 'searching for raw sequences with Aho-Corasick': function (topic) {
			var matcher = new Matcher({algorithm: 'aho-corasick'});
			topic.sequences.forEach(function(element, i) { matcher.addSequence({id:i, content: element}) });
			var result = matcher.search(topic.text);
			assert.equal(result.length, 4); // twitt, witt, twitter, itter
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