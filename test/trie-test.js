var vows = require('vows')
	, assert = require('assert')
	, Trie = require('../backend/lib/sequence/Trie')
	, AhoCorasick = require('../backend/lib/sequence/AhoCorasick')


vows.describe('Trie').addBatch({
	'distinct sequences tests': {
		topic: {
			sequences: ['lorem', 'ipsum', 'dolor']
		}
		, 'count after adding sequences': function(topic) {
			var trie = new Trie();
			topic.sequences.forEach(function(element) { trie.add(element); });
			assert.equal(trie.root.count, 3);
			topic.sequences.forEach(function(element) { trie.add(element); });
			assert.equal(trie.root.count, 3);
		}
		, 'count after removing sequences': function(topic) {
			var trie = new Trie();
			topic.sequences.forEach(function(element) { trie.add(element); });
			trie.remove(topic.sequences[0]);
			assert.equal(trie.root.count, 2);
		}
	}
	, 'subtree tests': {
		topic: {
			sequences: ['lorem', 'loram', 'ipsum', 'ipsam']
		}
		, 'count after adding sequences': function(topic) {
			var trie = new Trie();
			topic.sequences.forEach(function(element) { trie.add(element); });
			assert.equal(trie.root.count, 4);
		} 
		, 'count after removing sequences': function(topic) {
			var trie = new Trie();
			topic.sequences.forEach(function(element) { trie.add(element); });
			trie.remove(topic.sequences[0]);
			assert.equal(trie.root.count, 3);
		}
	}
	, 'search tests': {
		topic: {
			sequences: ['lor', 'lorem', 'or']
			, text: 'lorem ipsumdolor'
		}
		, 'simple search results': function(topic) {
			var trie = new Trie();
			topic.sequences.forEach(function(element) { trie.add(element); });
			assert.equal(trie.search(topic.text).length, 3);
		}
	}
	, 'aho-corasick tests' : {
		topic: {
			sequences: ['lor', 'lorem', 'or', 'rem']
			, text: 'lorem'
		}
		, 'insertion test': function(topic) {
			var trie = new AhoCorasick();
			topic.sequences.forEach(function(element) { trie.add(element); });
			assert.equal(trie.search(topic.text).length, 4);
		}
	}
}).export(module);
