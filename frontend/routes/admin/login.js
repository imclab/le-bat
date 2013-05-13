var fs = require('fs')
,	async = require('async')
,	formidable = require('formidable')
,	Auth = require('../../auth')
,	User = require('../../../model/user')


module.exports.index = function(req,res,next){
	res.locals.messages = false;
	if(req.session.messages) {
		res.locals.messages = req.session.messages;
		req.session.messages = false;
	}
		
	res.render('admin/login');
};


module.exports.register = function(req,res,next) {
	var form = new formidable.IncomingForm;

	form.parse(req, function(err,fields){
		if(err){
			console.log(err);
			return res.send(500,'An error occured while transmitting the form.');
		}

		async.waterfall([
			function(next){
				return next(null,req,res,fields);
			}
			, validate
			, saveUser
			, authenticate
		],function(err){
			if(err){
				console.log(err.error);
				return res.send(err.httpCode, err.message);
			} else{
				return res.redirect('/admin');
				return res.send(200, 'User created successfully');
			}
		});
	});
};


function validate(req,res,fields,next) {
	if(!fields.username) return res.send(400, 'Username required');
	if(!fields.password) return res.send(400, 'Password required');
	req.db.getAll(User.ModelInfo, { where: [{ col: 'name', val: fields.username }] }, function(err, result) {
		if(err) return next(err);
		if(result.length) return res.send(400, 'Username already exists.');
		next(null,req,res,fields);
	})
}

function saveUser(req,res,fields,next) {
	var salt = Auth.generateSalt();
	var hashedPassword = Auth.hashPassword(fields.password, salt);
	var user = User.fromObject({
		id: null,
		auth_type: 'local',
		name: fields.username,
		pass: hashedPassword,
		salt: salt,
		created: Date.now()
	});

	if(!req.db || !req.db.ready) 
		return done({error: 'Database not available', httpCode: 500, message: 'Database not available'});

	req.db.setAll(User.ModelInfo, [user], function(err, result) {
		if(err) 
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		res.locals.user = user;
		return next(null,req,res,fields);
	});
}

function authenticate(req,res,fields,next) {
	req.login(res.locals.user, function(err, user) {
		next(null);
	});
}