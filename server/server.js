var conf = require('../config')
,	TwitterStream = require('./lib/TwitterStream');

var tweetStream = new TwitterStream({
	consumerKey : conf.twitter.consumer_key
	, consumerSecret : conf.twitter.consumer_secret
	, accessToken : conf.twitter.access_token
	, accessSecret : conf.twitter.access_secret
});

tweetStream.on('tweet',function(data){
	console.log(data.text);
});

tweetStream.connect();
