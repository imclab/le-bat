var AdminRoutes = require('./admin/index')
,	ClientRoutes = require('./client/index');

module.exports.init = function(app){

	AdminRoutes.init(app);
	ClientRoutes.init(app);
}