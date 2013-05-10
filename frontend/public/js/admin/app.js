define([
	'./upload',
	'./sound'
],function(upload, sound){

	var app = {};

	app.init = function() {
		sound.createPlayer($('body'));
	};

	return app;
});
