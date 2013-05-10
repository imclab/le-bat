define([
	'./upload',
	'./sound',
	'./sequences',
	'./mapping'
],function(upload, sound, sequences, mapping){

	var app = {};

	app.init = function() {
		sound.createPlayer($('body'));
	};

	return app;
});
