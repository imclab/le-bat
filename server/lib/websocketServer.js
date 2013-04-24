var wsServer = require('ws').Server;

module.exports = WebSocketServer;

function WebSocketServer(options){
	this.server = new wsServer({port : options.port});
	this.clients = {};
	this.id = 0;

	var self = this;

	this.server.on('connection',function(client){
		// save the client
		client._clientId = self.generateId();
		self.clients[client._clientId] = client;

		client.on('close',function(){
			delete self.clients[client._clientId];
			console.log(self.clients);
		});
	});
}

WebSocketServer.prototype.generateId = function(){
	// for now a simple counter
	return this.id++;
};

WebSocketServer.prototype.broadcast = function(message){
	message = typeof message === "object" ? JSON.stringify(message) : message;

	for(clientId in this.clients){
		this.clients[clientId].send(message);
	}
};
