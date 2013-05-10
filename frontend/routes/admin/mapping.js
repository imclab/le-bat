var formidable = require('formidable')
,	async = require('async')
,	_ = require('underscore')
,	Sequence = require('../../../model/Sequence')
,	Sound = require('../../../model/Sound')
,	SequenceSoundMapping = require('../../../model/SequenceSoundMapping');



module.exports.get = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
			, getMapping
			, getSounds
		],function(err, req, res){
			if(err){
				console.log(err.error);
				res.send(err.httpCode, err.message);
			} else{
				return res.send(200, JSON.stringify({
					sequenceSoundMappings: res.locals.sequenceSoundMappings,
					sounds: res.locals.sounds
				}));
			}
		});
};


function getMapping(req, res, done) {
	var options = {
		where: [{
			col: 'sequence_id',
			val: req.params.sequenceId
		}]
	}
	req.db.getAll(SequenceSoundMapping.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
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
	req.db.getAll(Sound.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sounds = result;
		done(null, req, res);
	})
}




module.exports.set = function(req,res,next){
	var form = new formidable.IncomingForm;

	form.parse(req,function(err,fields) {
		if(err){
			console.log(err);
			return res.send('An error occured while transmitting the form.');
		}

		async.waterfall([
			function(done){
				return done(null,req,fields)
			}
			, validate
		],function(err, sequenceSoundMapping){
			if(err){
				console.log(err.error);
			} else {
				return res.send(500, 'Not there yet');
				return res.send(200, JSON.stringify(sequenceSoundMapping));
			}
		});
	});
};


function validate(req,fields,done){

	//return done(null,req,fields);
	return done(null, null, null);
}


function saveSequenceSoundMappings(req,sequenceSoundMapping,done){
	//req.db.setAll(SequenceSoundMapping.ModelInfo, mappings, function(err,result){
	//	if(err) return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
	//	return done(null,sequenceSoundMapping);
	//});
	return done(null,sequenceSoundMapping);
}
