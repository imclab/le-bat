var _ = require('underscore')
,	pjson = require('../package.json')
,	conf = require('../config')
,	TwitterStream = require('./lib/TwitterStream')
,	WebSocketServer = require('./lib/websocketServer')
,	Database = require('./lib/Database')
,	Store = require('./lib/sequence/Store')
,	http = require('http')
,	express = require('express')
,	Routes = require('./routes/index');

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
			sound_key : ~~(Math.random()*5)+1 // fine as result fits into 32-bit and will be changed later anyway
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
	console.log('Database error');
	console.log(err);
	process.exit();
});

db.on('ready', function() {
	// Fetch words, etc ..
})

db.init();


var sequenceStore = new Store();
tweetStream.on('tweet', function(data) {
	sequenceStore.parseText(data.text, new Date(data.created_at).getTime());
})
sequenceStore.setDb(db);


var app = express();

app.configure(function(){

	app.use(express.static(__dirname + '/public'));
    app.set('views',__dirname + '/views');
    app.set('view engine', 'jade');

	app.use(express.json());
	app.use(express.urlencoded());

	app.set('sitename', pjson.name);
	app.set('pagetitle', '');
	
	app.use(function(req,res,next) {
		res.locals.clientSettings = {
			websocket: conf.websocket
			, host: req.host
		};
		next();
	})

	app.use(function(req, res, next) {
		req.db = db;
		next();
	})
    
    app.use(app.router);

    // 404 handler
    app.use(function(req, res, next){
        return res.send(404);
    });

    // 500 handler
    app.use(function(err, req, res, next) {
    	console.log(err);
        return res.send(500);
    });
});

// init routes
Routes.init(app);
try{
	http.createServer(app).listen(conf.http.port);
	console.log('HTTP server running on: ' + conf.http.port);
} catch(err){
	console.log("HTTP server error");
	console.log(err);
	//process.exit();
}
