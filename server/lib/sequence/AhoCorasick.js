/**
 * This Aho-Corasick implementation updates the fall function
 * as new sequences are added/removed in contrast to the original implementation
 * where they have to be completely regenerated when the underlying trie changes. 
 */

var util = require('util'),
	Trie = require('./Trie')

module.exports = AhoCorasick;

function AhoCorasick() {
	Trie.call(this);
	this.root.level = 0;
	this.root.fall = this.root;
}

util.inherits(AhoCorasick, Trie);

/**
 * Update fall links when adding new sequences (deviates from original Aho-Corasick implementation)
 */
AhoCorasick.prototype.add = function(sequence, data) {
	var newNodes = [];
	AhoCorasick.super_.prototype.add.call(this, sequence, data, function(character, currentNode, newBranch) {
		if(newBranch) {
			// Add information for better traversal
			if(currentNode.parent.hasOwnProperty('children')) currentNode.parent.children.push(currentNode);
			else currentNode.parent.children = [currentNode];
			currentNode.level = currentNode.parent.level + 1;
			newNodes.push({node: currentNode, character: character});
		}
	});
	if(newNodes.length) {
		var newBranchLevel = newNodes[0].node.level;
		// Update links from new branch to existing ones
		newNodes.forEach(function(element){
			var fallNode = element.node.parent;
			while(fallNode != this.root)
				if(fallNode.fall[element.node.character]) {
					element.node.fall = fallNode.fall[element.node.character];
					break;
				} else fallNode = fallNode.fall;
			if(fallNode == this.root) element.node.fall = this.root;
		}, this);
		// ===================================================
		// TODO: Update links from existing ones to new branch
		// ===================================================
	}
}