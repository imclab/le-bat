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




module.exports.set = function(req,res,next){
	var form = new formidable.IncomingForm;

	form.parse(req,function(err,fields) {
		if(err){
			console.log(err);
			return res.send('An error occured while transmitting the form.');
		}

		async.waterfall([
			function(done){
				return done(null,req,res,fields)
			}
			, validateSequence
			, validateSound
			, checkForExistingMapping
			, saveMapping
		],function(err, sequenceSoundMapping){
			if(err){
				console.log(err.error);
			} else {
				return res.send(200, JSON.stringify(sequenceSoundMapping));
			}
		});
	});
};


function validateSequence(req,res,fields,done){
	if(!fields.sequence_id) return res.send(400, 'Missing field: sequence');

	req.db.getAll(Sequence.ModelInfo, { where: [{ col: 'id', val: fields.sequence_id }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return res.send(412, 'Referenced sequence does not exist.');
		res.locals.sequence = result;
		done(null, req, res, fields);
	});
}


function validateSound(req,res,fields,done){
	if(!fields.sound_id) return res.send(400, 'Missing field: sound');

	req.db.getAll(Sound.ModelInfo, { where: [{ col: 'id', val: fields.sound_id }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return res.send(412, 'Referenced sound does not exist.');
		res.locals.sound = result;
		done(null, req, res, fields);
	});
}


function checkForExistingMapping(req,res,fields,done){
	var options = { where: [{ col: 'sequence_id', val: res.locals.sequence[0].id }, 'and', { col: 'sound_id', val: res.locals.sound[0].id }] };
	req.db.getAll(SequenceSoundMapping.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		if(result.length) return res.send(412, 'Mapping already exists.')
		done(null, req, res, fields);
	});
}


function saveMapping(req,res,fields,done){
	var mapping = SequenceSoundMapping.fromObject({
		id: null,
		sequence_id: res.locals.sequence[0].id,
		sound_id: res.locals.sound[0].id,
		user_id: 0 // TODO: fill in
	})
	req.db.setAll(SequenceSoundMapping.ModelInfo, [mapping], function(err,result){
		if(err) return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		return done(null, mapping);
	});
}
