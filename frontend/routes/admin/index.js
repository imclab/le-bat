var main = require('./main')
,	sound = require('./sound')
,	mapping = require('./mapping')
,	login = require('./login')

module.exports.init = function(app){

	app.settings.auth.setFailureRedirect('/login');

	app.get('/login'
		, login.index
	);

	app.post('/register'
		, login.register
	);

	app.post('/login'
		, app.settings.auth.authenticate()
		, function(req, res) { res.redirect('/admin'); }
	);

	app.get('/logout', function(req, res){
		res.locals.user = null;
		req.logout();
		res.redirect('/');
	});

	app.get('/admin'
		, function(req,res,next) {app.settings.auth.ensure(req,res,next);} 
		, main.index
	);


	app.get('/admin/sound/get/:soundId'
		, sound.get
	);

	app.get('/admin/sound/all'
		, sound.getAll
	);

	app.post('/admin/sound/upload'
		, function(req,res,next) {app.settings.auth.ensure(req,res,next);} 
		, sound.upload
	);

	app.post('/admin/mapping'
		, function(req,res,next) {app.settings.auth.ensure(req,res,next);} 
		, mapping.editSet
	);

	app.get('/admin/mapping/:setId'
		, function(req,res,next) {app.settings.auth.ensure(req,res,next);} 
		, mapping.index
	);

	app.get('/admin/mapping/:setId/get/:sequenceId'
		, mapping.get
	);

	app.post('/admin/mapping/:setId/set'
		, function(req,res,next) {app.settings.auth.ensure(req,res,next);} 
		, mapping.set
	);
}