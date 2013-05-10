var AdminRoutes = require('./admin/index')
,	ClientRoutes = require('./client/client');

module.exports.init = function(app){

	app.get('/'
		, ClientRoutes.landing
	);

	app.get('/listen'
		, ClientRoutes.listen
	);

	AdminRoutes.init(app);
}