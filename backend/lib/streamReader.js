var events = require('events')
,	util = require('util');

module.exports = StreamReader; 


function StreamReader() {
	events.EventEmitter.call(this);
	this.buffer = '';
	return this;
};

StreamReader.END = '\r\n';
StreamReader.END_LENGTH = 2;
util.inherits(StreamReader, events.EventEmitter);

StreamReader.prototype.read = function receive(buffer) {
	var index, data;
	this.buffer += buffer.toString('utf8');

	while((index = this.buffer.indexOf(StreamReader.END)) > -1){

		data = this.buffer.slice(0, index);
		this.buffer = this.buffer.slice(index + StreamReader.END_LENGTH);

		if (data.length > 0) {
			try{
				json = JSON.parse(data)
				this.emit('data', json);
			} catch(err){
				this.emit('error',err);
			}
		}
	}
};