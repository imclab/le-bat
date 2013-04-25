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
	this.url = 'https://stream.twitter.com/1.1/statuses/filter.json?';
	var params = []
	for(param in options.query){
		if(param == "filter_level") params.push('filter_level=' + options.query.filter_level);
		if(param == "track") params.push('track=' + options.query.track.join(','));
		if(param == "locations") params.push('locations=' + options.query.locations.join(','));
		if(param == "language") params.push('language=' + options.query.language);
	}
	this.url += params.join('&');

	console.log(this.url);

	this.accessToken = options.accessToken;
	this.accessSecret = options.accessSecret;
	
	// create the streamreader and register the event handler
	this.streamReader = new StreamReader();
	this.registerEventHandlers();

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

TwitterStream.prototype.registerEventHandlers = function(){
	var self = this;

	this.streamReader.on('data',function(data){
		self.emit('tweet',data);
	});

	this.streamReader.on('error',function(err){
		self.emit('error',err);
	});
}

TwitterStream.prototype.abort = function(){
	if(this.request) this.request.abort();
	return;
}

