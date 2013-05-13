/**
 * All trie implementations I found did either collapsing or other kinds of 
 * space optimizations (not suitable for Aho-Corasick) or had unwanted 
 * functionality. Thus, here is a simple, and slim implementation which
 * preserves a full tree structure while trying to minimize space needs.
 * 
 * The structure therefore leverages JavaScript's dynamic object properties 
 * by putting child nodes as properties into their parent. Helper fields 
 * have more than one character so they won't get touched if characters 
 * are added, deleted or searched for.
 */
module.exports = Trie;

function Trie() {
	this.root = { count: 0 };
	this.root.parent = this.root;
}


Trie.prototype.clear = function() {
	this.root = { count: 0 }; 
	this.root.parent = this.root;
}

/*
FOR THE Aho-Corasick:
Update fall-links when adding sequences:
	1. Get the level of the root-closest NEW node 
	2. Get all nodes of that level in all other branches
		3.1 (linking other branches to new one)
			go each branch farther and look for fall functions to parent of new node
		3.2 (linking new one to other) 
			follow parents fall-function and see if one of the children matches the new node
*/




/**
 * @param {string} sequence The character sequence to store.
 * @param {Object=} data Optional data to put in for the sequence
 * @param {function(string, Object. Boolean)=} stepCallback An optional callback 
 * 	to call at each character in the trie. Takes the current character, its node
 *	and a flag whether it is a new branche as arguments. The scope (this) is the 
 *  Trie itself. Note that if you manipulate nodes in this callback, do NOT add 
 * 	properties that are single single characters as this would interfere with 
 * 	possible search queries.
 */
Trie.prototype.add = function(sequence, data, stepCallback) {
	var currentNode = this.root, 
		previousNode = null;
	sequence = sequence.toLowerCase();
	for(var i = 0, n = sequence.length; i < n; ++i) {
		var character = sequence.charAt(i);
		var newBranch = !currentNode.hasOwnProperty(character);
		previousNode = currentNode;
		if(newBranch) currentNode = currentNode[character] = { parent: previousNode, count: 0 };
		else currentNode = currentNode[character];
		if(stepCallback) stepCallback.call(this, character, currentNode, newBranch);
	}
	currentNode.data = data;

	// Increase count on each parent if this sequence is really new.
	// The original sequence is not stored in order to save memory.
	if(!currentNode.hasOwnProperty('terminal')) {
		currentNode.terminal = true;
		while(currentNode !== this.root) {
			++currentNode.count;
			currentNode = currentNode.parent;
		}
		++this.root.count;
	}
}


/**
 * Removes a sequence from the Trie.
 */
Trie.prototype.remove = function(sequence, deleteFn) {
	var currentNode = this.root,
		previousNodes = [this.root];
	sequence = sequence.toLowerCase();
	for(var i = 0, n = sequence.length; i < n; ++i) {
		var character = sequence.charAt(i);
		if(!(currentNode = currentNode[character])) return;
		previousNodes.push(currentNode);
	}
	if(!currentNode.terminal) return;
	for(var i = sequence.length - 1; i > 0; --i) {
		--currentNode.count;
		if(currentNode.count == 0) 
			delete currentNode.parent[sequence[i]];
	}
	--this.root.count;
}


/**
 * Search in a sequence for matches in this Trie.
 * @param {string} sequence A character sequence to search in for sequences managed by this Trie.
 * @param {function(Object,string):Object=} gotoFn A function that is called
 * 	when a node has a successor node for the given character.
 * @param {function(Object,string):Object=} failFn A function that is called
 * 	when a node has no successor node for the given character. It MUST return an
 * 	alternative node, at least `this.root`.
 */
Trie.prototype.search = function(sequence, gotoFn, failFn) {
	var currentNode = this.root,
		result = [];
	if(!sequence) return result;
	sequence = sequence.toLowerCase();
	for(var i = 0, n = sequence.length; i < n; ++i) {
		var character = sequence.charAt(i);
		if(!currentNode[character]) {
			currentNode = !failFn ? this.root : failFn.call(this, currentNode, character);
			if(currentNode == this.root && !!this.root[character]) currentNode = this.root[character];
		} else {
			if(!!gotoFn) {
				gotoFn.call(this, currentNode, character).forEach(function(element) {
					result.push({node: element, tail: i});
				}, this);
			}
			currentNode = currentNode[character];
		}
		if(currentNode.terminal) result.push({ node: currentNode, tail: i });
	}
	result.forEach(function(element, i){ // Trading off performance for memory savings.
		var length = 0, node = element.node;
		while(node.parent != this.root) {
			++length;
			node = node.parent;
		}
		result[i] = { 
			sequence: sequence.slice(element.tail - length, element.tail + 1),
			data: element.node.data,
			node: element.node
		};
	}, this);
	return result;
}


Trie.prototype._getNode = function(sequence) {
	var currentNode = this.root,
	sequence = sequence.toLowerCase();
	for(var i = 0, n = sequence.length; i < n; ++i) {
		var character = sequence.charAt(i);
		if(!currentNode[character]) return null;
		else currentNode = currentNode[character];
	}
	return currentNode;
}



Trie.prototype._getPrefix = function(node) {
	var character = '';
	for(var n in node.parent) if(node.parent[n] == node) { character = n; break; }
	if(node.parent == this.root) return '_' + character;
	return this._getPrefix(node.parent) + '-' + character; 
} 