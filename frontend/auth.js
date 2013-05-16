var passport = require('passport'),
	PassportLocalStrategy = require('passport-local').Strategy,
	Database = require('../shared/db/Database'),
	User = require('../shared/model/User'),
	crypto = require('crypto')

module.exports = Auth;

function Auth(app, db){
	this.app = app;
	this.db = db;
	this.failureRedirect = '';

	var self = this;
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	})

	passport.deserializeUser(function(id, done) {
		self.db.getAll(User.ModelInfo, { where: [{ col: 'id', val: id }] }, function(err, result) {
			if(result.length) done(err, User.fromObject(result[0]));
			else done(err, null);
		})
	})

	passport.use(new PassportLocalStrategy(
		function(username,password,done){ return self.verify(username,password,done) }
	));


	this.app.set('auth', this);

	this.app.use(passport.initialize());
	this.app.use(passport.session());
}

Auth.prototype.setFailureRedirect = function(path) {
	this.failureRedirect = path;
}

Auth.prototype.verify = function(username, password, done) {
	this.db.getAll(User.ModelInfo, { where: [{ col: 'name', val: username }] }, function(err, result) {
		if(err)
			return done(err);
		if(!result.length) 
			return done(null, false, { message: 'User not found.' });
		var user = User.fromObject(result[0]);
		if(Auth.hashPassword(password, user.salt + '') != user.pass) 
			return done(null, false, { message: 'Wrong password.'});
		return done(null, user);
	})
}

Auth.generateSalt = function() {
	return Math.round((new Date().valueOf() * Math.random())) + '';
}

Auth.hashPassword = function(password, salt) {
	return crypto.createHmac('sha512', salt).update(password).digest('hex');
}

Auth.prototype.authenticate = function() {
	return passport.authenticate('local', { failureRedirect: this.failureRedirect, failureMessage: true });
}

Auth.prototype.ensure = function(req, res, next) {
	if(req.isAuthenticated()) return next();
	res.redirect(this.failureRedirect);
}