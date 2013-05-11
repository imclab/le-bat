var main = require('./main')
,	client = require('./client');

module.exports.init = function(app){

	app.get('/'
		, main.index
	);

	app.get('/listen'
		, client.index
	);
};