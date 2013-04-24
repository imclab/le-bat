var util = require('util')
	, events = require('events')
	, OAuth = require('oauth').OAuth
	, StreamReader = require('./streamReader')

module.exports = TwitterStream;

function TwitterStream(options){

	if(!options.consumerKey || !options.consumerSecret || !options.accessToken || !options.accessSecret || !options.query){
		// throw error
		console.log('incomplete!');
	}

    events.EventEmitter.call(this);

    // build the query url
    this.url = 'https://stream.twitter.com/1.1/statuses/filter.json?delimited=length';
    if(options.query.track) this.url += '&track=' + options.query.track.join(',');
    if(options.query.locations) this.url += '&locations=' + options.query.locations.join(',');

    console.log(this.url);

    this.accessToken = options.accessToken;
    this.accessSecret = options.accessSecret;
    
    this.streamReader = new StreamReader({
		'sizeLength' : 6
    	, 'sizeReader' : function(buffer){
    		return parseInt(buffer.toString('utf8',0,4));
    	}
	});

    this.registerDataHandler();

	this.twitterLogin = new OAuth(
		'https://twitter.com/oauth/request_token'
        , 'https://twitter.com/oauth/access_token'
        , options.consumerKey
        , options.consumerSecret
        , '1.0A'
        , null
        , 'HMAC-SHA1'
    );
}

util.inherits(TwitterStream, events.EventEmitter);

TwitterStream.prototype.connect = function(query){
	if(this.request != undefined){
		this.abort();
	}

	this.request = this.twitterLogin.get(this.url, this.accessToken, this.accessSecret);

	var self = this;
	self.request.on('response',function(response){
		response.on('data',function(chunk){
			self.streamReader.read(chunk);
		});
	});
	self.request.end();
};

TwitterStream.prototype.registerDataHandler = function(){
	var self = this;
	this.streamReader.on('data',function(data){
		data = data.toString('utf8',6);
		try{
			var json = JSON.parse(data);
			self.emit('tweet',json);
		} catch(err){
			console.log(err);
		}
	});
}

TwitterStream.prototype.abort = function(){
	if(this.request) this.request.abort();
	return;
}

