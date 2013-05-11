var main = require('./main')
,	sound = require('./sound')
,	mapping = require('./mapping')

module.exports.init = function(app){

	app.get('/admin'
		, main.index
	);

	app.get('/admin/sound/get/:soundId'
		, sound.get
	);

	app.get('/admin/sound/all'
		, sound.getAll
	);

	app.post('/admin/sound/upload'
		, sound.upload
	);

	app.get('/admin/mapping/get/:sequenceId'
		, mapping.get
	);

	app.post('/admin/mapping/set'
		, mapping.set
	);
}