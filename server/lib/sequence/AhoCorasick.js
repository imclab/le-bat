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
	this.root.rises = {};
}

util.inherits(AhoCorasick, Trie);

/**
 * Update fall links when adding new sequences (deviates from original Aho-Corasick implementation)
 */
AhoCorasick.prototype.add = function(sequence, data) {
	AhoCorasick.super_.prototype.add.call(this, sequence, data, function(character, currentNode, newBranch) {
		if(newBranch) {
			currentNode.character = character.charCodeAt(0);
			currentNode.level = currentNode.parent.level + 1;
			currentNode.rises = {}; 
			currentNode.rises[character] = [];

			// Create links from new branch to existing ones.
			var fallNode = currentNode.parent;
			while(fallNode != this.root) {
				fallNode = fallNode.fall;
				var nextNode = fallNode[character];
				if(nextNode && !this._isChildOf(nextNode, currentNode)) {
					currentNode.fall = nextNode;
					break;
				}
			}
			if(fallNode == this.root) currentNode.fall = this.root;
			if(fallNode.rises[character]) fallNode.rises[character].push(currentNode);
			else fallNode.rises[character] = [currentNode];

			// Update links from existing ones to new branch
			fallNode = currentNode.parent;
			while(true) {
				var fallRises = fallNode.rises[character];
				var nextRises = currentNode.rises[character];
				if(fallRises) {
					for(var i=fallRises.length-1; i>=0; --i) {
						var rise = fallRises[i];

						if(rise.level <= currentNode.level) continue;

						//console.log('Possible rise from ', this._getPrefix(currentNode), ' to ', this._getPrefix(rise),
						//	fallNode == this.root ? ' on root level ' : '');

						if(fallNode != this.root) {
							var targetRiseNode = rise;
							//if(targetRiseNode.fall != this.root) 
							//	console.log('Target Rise Node ' + this._getPrefix(targetRiseNode),
							//		' for ' +this._getPrefix(currentNode) ,' already has a non-root fall: ', this._getPrefix(targetRiseNode.fall));
							//while(targetRiseNode.fall.level > currentNode.level) {
							//	targetRiseNode = targetRiseNode.fall;
							//}
							targetRiseNode.fall = currentNode;
							nextRises.push(targetRiseNode);
							fallRises.splice(i, 1);
						} else {
							if(this._sharesPrefix(rise.parent, currentNode.parent)) {
								if(rise.fall != this.root) {
									//console.log('Target Rise Node ' + this._getPrefix(rise),
									//	' for ' +this._getPrefix(currentNode) ,' already has a non-root fall: ', this._getPrefix(rise.fall));
								} else {
									rise.fall = currentNode;
									nextRises.push(rise);
									fallRises.splice(i, 1);
								}
							}
						}
					}
				}
				if(fallNode == this.root) break;
				else fallNode = this.root;
			}
			
		}
	});
}


AhoCorasick.prototype.search = function(sequence) {
	var result = AhoCorasick.super_.prototype.search.call(this, sequence, 
		function(currentNode, character) {
			var result = [];
			var nextNode = currentNode[character].fall;
			while(nextNode != this.root){
				if(nextNode.terminal) result.push(nextNode);
				nextNode = nextNode.fall;
			}
			return result;
		}, 
		function(currentNode, character) {
			var nextNode = currentNode.fall;
			while(nextNode != this.root) {
				if(nextNode[character]) return nextNode[character];
				else nextNode = nextNode.fall;
			}
			return nextNode;
		}
	);
	return result;
}


AhoCorasick.prototype._isChildOf = function(node, child) {
	if(child.level < node.level) return false;
	if(child == this.root) return false;
	if(child.parent == node) return true;
	return this._isChildOf(node, child.parent);
}


AhoCorasick.prototype._sharesPrefix = function(a, b) {
	return true; 
	// seems we don't need this ...
	if(a == this.root || b == this.root) return true;
	if(a.character != b.character) return false;
	return this._sharesPrefix(a.parent, b.parent);
}