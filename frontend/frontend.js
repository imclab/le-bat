var _ = require('underscore')
,	pjson = require('../package.json')
,	conf = require('../config')
,	Database = require('../server/lib/Database')
,	http = require('http')
,	express = require('express')
,	Routes = require('./routes/index');


var db = new Database(conf.db);

db.on('error', function(err) {
	console.log('Database error', err);
	console.trace();
	console.log('Shutting down in 2 seconds.');
	setTimeout(process.exit, 2000);
});

db.init();

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
