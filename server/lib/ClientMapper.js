var SequenceSoundMapping = require('../../model/SequenceSoundMapping')

module.exports = ClientMapper;


function ClientMapper(db, store, wss) {
	this.db = db;
	this.store = store;
	this.wss = wss;

	this.connectedSets = [];
}

ClientMapper.prototype.addClient = function(client) {
	if(!this.db || !this.db.ready) 
		return this.wss.sendMessageToClient({error: 'Database not available'});

	var options = { where: [
		{ col: 'set_id', val : client.settings.sequenceSoundSet }
	] };

	var self = this;
	this.db.getAll(SequenceSoundMapping.ModelInfo, options, function(err, result) {
		if(err) return self.wss.sendMessageToClient({error: err});
		if(!result.length) return self.wss.sendMessageToClient({error: 'Set does not exist or has no mappings.'});
		var mappingsBySequenceId = {};
		result.forEach(function(mapping) {
			mappingsBySequenceId[mapping.sequence_id] = mapping;
		})
		self.connectedSets.push({
			client: client,
			mappingsBySequenceId: mappingsBySequenceId
		});
	})
}


ClientMapper.prototype.removeClient = function(client) {
	for(var i = this.connectedSets.length - 1; i>=0; --i)
		if(this.connectedSets[i].client == client) {
			this.connectedSets.splice(i,1);
			return;
		}
}


ClientMapper.prototype.processTweet = function(tweet) {
	var nodes = [];
	try {
		nodes = this.store.matcher.search(tweet.text);
	} catch(err) {
		console.log(err.stack);
		process.exit();
	}
	
	var sequences = [];
	nodes.forEach(function(node) {
		if(node.data.id) // only take sequences that have an id
			sequences.push(node.data); // TODO: make this fast by returning just the data in the Trie implementation
	})

	this.connectedSets.forEach(function(connectedSet) {
		var mappingIdsToSend = [];
		sequences.forEach(function(sequence) {
			if(connectedSet.mappingsBySequenceId[sequence.id])
				mappingIdsToSend.push(connectedSet.mappingsBySequenceId[sequence.id].id);
		});
		if(!mappingIdsToSend.length) return
		console.log('Found mappingIds for client', mappingIdsToSend);
	})
}