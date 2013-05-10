define([
	'eventEmitter',
	'utils'
],function(EventEmitter,Util){

	//Wrapper for websocket in order encapsulate parsing, reconnections etc.
	function WebsocketConnection(url){

		EventEmitter.call(this);
		this.url = url;

		this.connect = function(){
			this.socket = new WebSocket(this.url);

			var self = this;
			
			this.socket.onopen = function(){
				self.emit('connected');
			};

			this.socket.onerror = function(err){
				console.log(err);
				// reconnect
				self.connect();
			};

			this.socket.onclose = function(){
				self.emit('close');
			};

			this.socket.onmessage = function(msg){
				try{
					var json = JSON.parse(msg.data);
					self.emit('data',json);
				} catch(e){
					console.error('error while parsing incoming message');
				}
			};
		};
	}

	// inherit from EventEmitter
	Util.inherits(WebsocketConnection,EventEmitter);

	return WebsocketConnection;
});


