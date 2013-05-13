var fs = require('fs')
,	async = require('async')
,	Sequence = require('../../../model/Sequence')
,	Sound = require('../../../model/Sound')
,	SequenceSoundSet = require('../../../model/SequenceSoundSet')
,	Tag = require('../../../model/Tag')
,	TagSoundMapping = require('../../../model/TagSoundMapping');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
			, getSequenceSoundSets
			, getSequences
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

function getSequences(req, res, done) {
	var options = {
		order: [{
			col: 'total_count',
			desc: true
		}],
		limit: {
			offset: 42,
			count: 42
		}
	}
	req.db.getAll(Sequence.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sequences = result;
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

