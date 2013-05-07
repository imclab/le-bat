// general Utility function holder
var Util = function(){};

Util.inherits = function(child,parent){
    child.super_ = parent;
    child.prototype = Object.create(parent.prototype,{
        constructor: {
            value: child,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

// Very simple Micro Event Emitter
var EventEmitter = function(){
	this._events = {};
};

EventEmitter.prototype.on = function(event,cb){
	this._events[event] = this._events[event] || [];
	this._events[event].push(cb);
};

EventEmitter.prototype.unbind = function(event,cb){
	if( event in this._events === false  )	return;
	this._events[event].splice(this._events[event].indexOf(cb), 1);
};

EventEmitter.prototype.trigger = function(event){
	if(event in this._events === false)	return;
	for(var i = 0, length = this._events[event].length; i < length; i++){
		this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
	}
};

// Wrapper for websocket in order encapsulate parsing, reconnections etc.
function WebSocketConnection(url){

	EventEmitter.call(this);
	this.url = url;
	
	this.connect = function(){
		this.socket = new WebSocket(this.url);

		var self = this;
		this.socket.onopen = function(){
			self.trigger('connected');
		};

		this.socket.onerror = function(err){
			console.log(err);
			// reconnect
			self.connect();
		};

		this.socket.onclose = function(){
			self.trigger('close');
		};

		this.socket.onmessage = function(msg){
			try{
				var json = JSON.parse(msg.data);
				self.trigger('data',json);
			} catch(e){
				console.error('error while parsing incoming message');
			}
		};
	};
}

Util.inherits(WebSocketConnection,EventEmitter);

$(function(){
	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var websocket = new WebSocketConnection(wsUrl);

	websocket.on('data',function(data){
		console.log(data);
	});

	websocket.on('close',function(){
		alert('websocket connection closed');
	});

	websocket.connect();

});