var wsServer = require('ws').Server
,	util = require('util')
,	events = require('events');

module.exports = WebSocketServer;

function WebSocketServer(options){
	this.port = options.port;
	this.clients = {};
	this.id = 0;

	events.EventEmitter.call(this);
}

util.inherits(WebSocketServer, events.EventEmitter);

WebSocketServer.prototype.listen = function(){
	
	var self = this;

	self.server = new wsServer({port : self.port});

	self.server.on('connection',function(client){
		// save the client
		client._clientId = self.generateId();
		self.clients[client._clientId] = client;

		client.on('close',function(){
			delete self.clients[client._clientId];
			console.log(self.clients);
		});
	});

	self.emit('ready',self.port);
};

WebSocketServer.prototype.generateId = function(){
	// for now a simple counter
	return this.id++;
};

WebSocketServer.prototype.broadcast = function(message){
	var self = this;
	message = typeof message === "object" ? JSON.stringify(message) : message;

	for(clientId in self.clients){
		self.clients[clientId].send(message,function(err){
			if(err) self.emit('error',err);
		});
	}
};
