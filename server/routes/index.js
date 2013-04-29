var AdminRoutes = require('./admin')
,	ClientRoutes = require('./client');

module.exports.init = function(app){

	app.get('/'
		, ClientRoutes.index
	);

	app.get('/admin'
		// might wanna add some login/session stuff
		, AdminRoutes.index
	);

	app.post('/admin'
		, AdminRoutes.update
	);

}