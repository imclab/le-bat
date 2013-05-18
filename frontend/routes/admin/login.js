var fs = require('fs')
,	async = require('async')
,	formidable = require('formidable')
,	Auth = require('../../auth')
,	User = require('../../../shared/model/User')


module.exports.index = function(req,res,next){
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
				if(err.error) console.log(err.error);
				req.session.messages = [err.message];
				return res.redirect('/login#register');
				return res.send(err.httpCode, err.message);
			} else{
				return res.redirect('/admin');
				return res.send(200, 'User created successfully');
			}
		});
	});
};


function validate(req,res,fields,next) {
	if(!fields.username) return next({httpCode: 400, message: 'Username required.'});
	if(!fields.password) return next({httpCode: 400, message: 'Password required.'});
	if(fields.password != fields.password_confirm) next({httpCode: 400, message: 'Passwords don\'t match.'});
	req.db.getAll(User.ModelInfo, { where: [{ col: 'name', val: fields.username }] }, function(err, result) {
		if(err) return next(err);
		if(result.length) return next({httpCode: 400, message: 'User already exists.'});
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
		return next({error: 'Database not available', httpCode: 500, message: 'Database not available'});

	req.db.setAll(User.ModelInfo, [user], function(err, result) {
		if(err) 
			return next({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		res.locals.user = user;
		return next(null,req,res,fields);
	});
}

function authenticate(req,res,fields,next) {
	req.login(res.locals.user, function(err, user) {
		next(null);
	});
}