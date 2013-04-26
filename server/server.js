var conf = require('../config')
,	TwitterStream = require('./lib/TwitterStream')
,	WebSocketServer = require('./lib/websocketServer')
,	Database = require('./lib/Database')

var server = new WebSocketServer({port : conf.websocket.port});

var tweetStream = new TwitterStream({
	query : conf.twitter.query
	, consumerKey : conf.twitter.consumer_key
	, consumerSecret : conf.twitter.consumer_secret
	, accessToken : conf.twitter.access_token
	, accessSecret : conf.twitter.access_secret
});

tweetStream.on('tweet',function(data){
	
	// we need specific coordinates!
	if(data.coordinates){
		server.broadcast({
			sound_key : ~~(Math.random()*100)+1 // fine as result fits into 32-bit and will be changed later anyway
			, location : data.coordinates.coordinates
			, timestamp : +new Date
			, tweet : data.id_str
		});
	}
});

tweetStream.on('error',function(err){
	console.log(err);
});

tweetStream.connect();


var db = new Database(conf.db);

db.on('error', function(err) {
	console.error(err);
	process.exit();
});

db.on('ready', function() {
	// Fetch words, etc ..
})

db.init();
