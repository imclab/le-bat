var fs = require('fs')
,	async = require('async')
,	Sequence = require('../../../model/Sequence')
,	Sound = require('../../../model/Sound')
,	Tag = require('../../../model/Tag')
,	TagSoundMapping = require('../../../model/TagSoundMapping');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
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


function getSequences(req, res, done) {
	var options = {
		order: [{
			col: 'total_count',
			desc: true
		}],
		limit: {
			offset: 100,
			count: 100
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

