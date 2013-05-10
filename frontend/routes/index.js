var AdminRoutes = require('./admin/admin')
,	ClientRoutes = require('../../server/routes/client');

module.exports.init = function(app){

	app.get('/'
		, ClientRoutes.landing
	);

	app.get('/listen'
		, ClientRoutes.listen
	);

	app.get('/admin'
		// might wanna add some login/session stuff
		, AdminRoutes.index
	);

	app.post('/admin/upload'
		, AdminRoutes.uploadSound
	);

}