var fs = require('fs')
,	async = require('async')
,	Sequence = require('../../../shared/model/Sequence')
,	Sound = require('../../../shared/model/Sound')
,	SequenceSoundSet = require('../../../shared/model/SequenceSoundSet')
,	Tag = require('../../../shared/model/Tag')
,	TagSoundMapping = require('../../../shared/model/TagSoundMapping');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
			, getSequenceSoundSets
			, getSounds
		],function(err){
			if(err){
				console.log(err.error);
				res.send(err.httpCode, err.message);
			} else{
				return res.render('admin/index');
			}
		});
};

function getSequenceSoundSets(req, res, done) {

	req.db.getAll(SequenceSoundSet.ModelInfo, { where: [{ col: 'user_id', val: req.user.id }] }, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sets = result;
		done(null, req, res);
	})
}

function getSounds(req, res, done) {
	req.db.getAll(Sound.ModelInfo, null, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sounds = result;
		done(null, req, res);
	})
}

