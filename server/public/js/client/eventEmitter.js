define([
],function(){
	// This module represents a very simple Micro Event Emitter
	// which can be used for pub/sub events
	function EventEmitter(){
		this._events = {};
	}

	EventEmitter.prototype.on = function(event,cb){
		this._events[event] = this._events[event] || [];
		this._events[event].push(cb);
	};

	EventEmitter.prototype.off = function(event,cb){
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(cb), 1);
	};

	EventEmitter.prototype.emit = function(event){
		if(event in this._events === false)	return;
		for(var i = 0, length = this._events[event].length; i < length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};

	return EventEmitter;
});