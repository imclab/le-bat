var _ = require('underscore')
,	pjson = require('../package.json')
,	conf = require('../config')
,	TwitterStream = require('./lib/TwitterStream')
,	WebSocketServer = require('./lib/websocketServer')
,	Database = require('./lib/Database')
,	Store = require('./lib/sequence/Store')

var websocket = new WebSocketServer({port : conf.websocket.port});

websocket.on('ready',function(port){
	console.log('WebSocket listening on port: ' + port);
});

websocket.on('error',function(err){
	console.log('error while broadcasting');
	console.log(err);
});

websocket.listen();

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
		websocket.broadcast({
			sound_key : ~~(Math.random()*20)+1 // fine as result fits into 32-bit and will be changed later anyway
			, location : data.coordinates.coordinates
			, timestamp : new Date(data.created_at).getTime()
			, tweet : data.id_str
		});
	}
});

tweetStream.on('error',function(err){
	console.log('tweetStream error');
	console.log(err);
});

tweetStream.connect();


var db = new Database(conf.db);

db.on('error', function(err) {
	console.log('Database error', err);
	console.trace();
	console.log('Shutting down in 2 seconds.');
	setTimeout(process.exit, 2000);
});

db.init();


var sequenceStore = new Store();
tweetStream.on('tweet', function(data) {
	sequenceStore.parseText(data.text, new Date(data.created_at).getTime());
})
sequenceStore.setDb(db);
