var main = require('./main')
,	upload = require('./upload')

module.exports.init = function(app){

	app.get('/admin'
		, main.index
	);

	app.post('/admin/upload'
		, upload.index
	);

}