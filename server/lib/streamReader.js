var events = require('events')
,	util = require('util');

exports = module.exports = StreamReader;

function StreamReader(options){

	if(!options.sizeLength || options.sizeReader){
		// throw error here
	};

	this.sizeReader = options.sizeReader;
	this.sizeLength = options.sizeLength;
	this.partialSizeBuffer = null; 
	this.partialSizeLength = 0;
	this.message =  null;
	this.readSoFar = 0;

	events.EventEmitter.call(this);
}

// inherit from EventEmitter
util.inherits(StreamReader, events.EventEmitter);

StreamReader.prototype.read = function(buffer){
	if(this.message == null){ // new message
		if(this.initialize(buffer)){ // true means we have the size in the current message
			// reset size buffer and it's index counter
			this.partialSizeBuffer = null;
			this.partialSizeLength = 0;
		}else{ // we don't have the full size yet
			return;
		}
	}

	var toRead = this.message.length - this.readSoFar;
	if(toRead > buffer.length){ // prevent overreading
		toRead = buffer.length;
	}

	buffer.copy(this.message,this.readSoFar,0,toRead);
	this.readSoFar += toRead;

	if(this.readSoFar === this.message.length){ // gotcha!
		this.emit('data',this.message);
		this.message = null;
		if(toRead < buffer.length){ // does this buffer wanna tell us some more stuff?
			return this.read(buffer.slice(toRead)); 
		}
	}
};


StreamReader.prototype.initialize = function(buffer){
	if(this.partialSizeBuffer == null){ // no size info

		if(buffer.length < this.sizeLength){ // buffer doesn't contain full size
			this.partialSizeBuffer = new Buffer(this.sizeLength);
			this.partialSizeLength = buffer.length;
			buffer.copy(this.partialSizeBuffer);
			return false; // not ready yet
		}

		// buffer has full size
		this.message = new Buffer(this.sizeReader(buffer) + this.sizeLength);
		this.readSoFar = 0;
		return true; // go for it

	} else{ // we already have some info
		if(this.partialSizeBuffer + buffer.length >= this.sizeLength){
			buffer.copy(this.partialSizeBuffer,this.partialSizeLength,0,this.sizeLength - this.partialSizeLength);
			this.message = new buffer(this.sizeReader(this.partialSizeBuffer) + this.sizeLength);
			return true; // go for it

		} else { // still not the full size packe received
			buffer.copy(this.partialSizeBuffer,this.partialSizeLength,0,buffer.length);
			this.partialSizeLength += buffer.length;
			return false; // not ready to read in so far
		}
	}
};

