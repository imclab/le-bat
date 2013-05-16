var wsServer = require('ws').Server
,	util = require('util')
,	events = require('events')
,	uuid = require('uuid');

module.exports = WebSocketServer;

function WebSocketServer(options){
	this.port = options.port;
	this.clients = {};

	events.EventEmitter.call(this);
}

util.inherits(WebSocketServer, events.EventEmitter);

WebSocketServer.prototype.listen = function(){
	
	var self = this;

	self.server = new wsServer({port : self.port});

	self.server.on('connection', function(socket){
		// save the client
		var client = {
			socket: socket
			, id : self.generateId()
			, settings: null
		}
		self.clients[client.id] = client;

		socket.on('message', function(data, flags) {
			client.settings = JSON.parse(data);
			self.emit('clientReady', client);
		});

		socket.on('close',function(){
			self.emit('clientDone', client);
			delete self.clients[client.id];
		});
	});

	self.emit('ready',self.port);
};

WebSocketServer.prototype.generateId = function(){
	// generate RFC4122 v4 UUID
	return uuid.v4();
};

WebSocketServer.prototype.sendMessageToClient = function(client, message){
	var self = this;
	message = typeof message === "string" ? message : JSON.stringify(message);
	
	client.socket.send(message,function(err){
		if(err) {
			self.emit('error',err);
		}
	});
};


WebSocketServer.prototype.broadcast = function(message){
	var self = this;
	message = typeof message === "object" ? JSON.stringify(message) : message;

	for(clientId in self.clients){
		self.clients[clientId].socket.send(message,function(err){
			if(err) self.emit('error',err);
		});
	}
};
