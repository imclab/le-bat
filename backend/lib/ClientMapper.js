var Matcher = require('./sequence/Matcher'),
	Sequence = require('../../shared/model/Sequence')
	SequenceSoundMapping = require('../../shared/model/SequenceSoundMapping')

module.exports = ClientMapper;


function ClientMapper(db, wss) {
	this.db = db;
	this.wss = wss;

	this.connectedSets = [];
}


ClientMapper.prototype.addClient = function(client) {
	if(!this.db || !this.db.ready) 
		return this.wss.sendMessageToClient({error: 'Database not available'});

	var connectedSet = {
		client: client,
		matcher: new Matcher({algorithm: 'aho-corasick'})
	}

	var self = this;

	this.db.getAll(SequenceSoundMapping.ModelInfo, { where: [{ col: 'set_id', val : client.settings.sequenceSoundSet }] }, function(err, result) {
		if(err) return self.wss.sendMessageToClient({error: err});
		if(!result.length) return self.wss.sendMessageToClient({error: 'Set does not exist or has no mappings.'});
		
		var mappingsBySequenceId = {};

		var options = { where: [] };
		result.forEach(function(mapping) {
			mappingsBySequenceId[mapping.sequence_id] = mapping;
			options.where.push({
				col: 'id',
				val: mapping.sequence_id
			});
			options.where.push('or')
		});
		options.where.pop();

		self.db.getAll(Sequence.ModelInfo, options, function(err, result) {
			if(err) return self.wss.sendMessageToClient({error: err});
			if(!result.length) return self.wss.sendMessageToClient({error: 'Can\'t find mapped sequences.'});
			result.forEach(function(sequence) {
				connectedSet.matcher.addSequence(sequence, mappingsBySequenceId[sequence.id]);
			});

			self.connectedSets.push(connectedSet);
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

	this.connectedSets.forEach(function(connectedSet) {
		var sequenceSoundIdsToSend = [];
		
		var nodes = connectedSet.matcher.search(tweet.text);
		nodes.forEach(function(node) { // TODO: make this fast by returning just the data in the Trie implementation
			sequenceSoundIdsToSend.push(node.data.id);
		})

		if(!sequenceSoundIdsToSend.length) return;

		this.wss.sendMessageToClient(connectedSet.client, {
			sequenceSoundIds: sequenceSoundIdsToSend
			, location : tweet.coordinates.coordinates
			, timestamp : new Date(tweet.created_at).getTime()
			, tweet : tweet.id_str
		});

	}, this)
}