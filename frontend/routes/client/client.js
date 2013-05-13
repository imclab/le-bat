var async = require('async')
	, Sound = require('../../../model/Sound')
	, SequenceSoundSet = require('../../../model/SequenceSoundSet')
	, SequenceSoundMapping = require('../../../model/SequenceSoundMapping')
	, User = require('../../../model/User')


module.exports.listenTo = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
			, getSet
			, getAuthor
			, getMappings
			, getSounds
		],function(err, req, res){
			if(err){
				console.log(err.error);
				res.send(err.httpCode, err.message);
			} else{
				res.locals.clientSettings.sequenceSoundSet = {
					set: res.locals.sequenceSoundSet
					, author: res.locals.author
					, mappings: res.locals.sequenceSoundMappings
					, sounds: res.locals.sounds
				};
				return res.render('client/listen');
			}
		});
};


function getSet(req, res, done) {
	req.db.getAll(SequenceSoundSet.ModelInfo, { where: [{ col:'id', val: req.params.setId }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return done({error: 'set not found', httpCode:404, message: 'Set not found.'});
		res.locals.sequenceSoundSet = result[0];
		done(null, req, res);
	})
}


function getAuthor(req, res, done) {
	req.db.getAll(User.ModelInfo, { where: [{ col:'id', val: res.locals.sequenceSoundSet.user_id }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return done({error: 'author of set not found', httpCode:404, message: 'Author of set not found.'});
		res.locals.author = result[0];
		done(null, req, res);
	})
}


function getMappings(req, res, done) {
	req.db.getAll(SequenceSoundMapping.ModelInfo, { where: [{ col:'set_id', val: req.params.setId }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return res.send(200, JSON.stringify([]));
		res.locals.sequenceSoundMappings = result;
		done(null, req, res);
	})
}


function getSounds(req, res, done) {
	var options = { where: [] };
	res.locals.sequenceSoundMappings.forEach(function(mapping) {
		options.where.push({
			col: 'id',
			val: mapping.sound_id
		});
		options.where.push('or');
	});
	if(options.where.length) options.where.pop(); // removing last or

	req.db.getAll(Sound.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sounds = result;
		done(null, req, res);
	})
}