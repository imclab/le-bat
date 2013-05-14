var formidable = require('formidable')
,	async = require('async')
,	_ = require('underscore')
,	Sequence = require('../../../model/Sequence')
,	Sound = require('../../../model/Sound')
,	SequenceSoundMapping = require('../../../model/SequenceSoundMapping')
,	SequenceSoundSet = require('../../../model/SequenceSoundSet');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');
	
	res.locals.clientSettings.setId = req.params.setId;

	async.waterfall([
			function(done){
				return done(null, req, res)
			}
			, getSequenceSoundSets
			, getSequences
		],function(err){
			if(err){
				console.log(err.error);
				res.send(err.httpCode, err.message);
			} else{
				return res.render('admin/mappingIndex');
			}
		});
};

function getSequenceSoundSets(req, res, done) {
	req.db.getAll(SequenceSoundSet.ModelInfo, { where: [{ col: 'id', val: req.params.setId }] }, function(err, result) {
		if(err) return res.send(500, err);
		if(!result.length) return done({error: 'Unknown set id requested', httpCode: 404, message: 'Set does not exist.'});
		if(result[0].user_id != req.user.id) return done({error: 'Tried to edit another user\'s set', httpCode: 403, message: 'Can\'t edit other user\'s sets'})
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
			offset: 5,
			count: 420
		}
	}
	req.db.getAll(Sequence.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sequences = result;
		done(null, req, res);
	})
}


/******************************************************************************
 * Route editSet
 *****************************************************************************/

module.exports.editSet = function(req, res, next) {
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	var form = new formidable.IncomingForm;

	form.parse(req,function(err,fields) {
		if(err){
			console.log(err);
			return res.send('An error occured while transmitting the form.');
		}

		async.waterfall([
			function(next){
				return next(null, req, res, fields)
			}
			, validateSet
			, saveSet
		], function(err, req, res){
			if(err){
				console.log(err.error);
				res.send(err.httpCode, err.message);
			} else{
				return res.send(200, JSON.stringify({
					sets: res.locals.sets
				}));
			}
		});
	});
}


function validateSet(req,res,fields,next) {
	if(!fields.name) return res.send(400, 'Missing field: name');

	var options = { where: [
		{ col: 'id', val:fields.id }, 'and', { col:'user_id', val: req.user.id }, 'and', {col: 'name', val: fields.name }
	] };

	req.db.getAll(SequenceSoundSet.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		if(result.length) return res.send(412, 'A set with that name already exists.');
		if(fields.id) {	
			options.pop();
			options.pop();
			req.db.getAll(SequenceSoundSet.ModelInfo, options, function(err, result) {
				if(err) return res.send(500, err);
				if(!result.length) return res.send(412, 'You can\'t sets that are not existing or don\'t belong to you.');
				result[0].updated = Date.now();
				res.locals.sets = result;
				next(null, req, res, fields);
			});
		} else next(null, req, res, fields);
	});
}

function saveSet(req,res,fields,next) {
	if(!res.locals.sets) {
		res.locals.sets = [SequenceSoundSet.fromObject({
			id: null,
			user_id: req.user.id,
			name: fields.name,
			created: Date.now(),
			updated: Date.now()
		})];
	}
	req.db.setAll(SequenceSoundSet.ModelInfo, res.locals.sets, function(err, result) {
		if(err) return next({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		return next(null, req, res);
	})
}


/******************************************************************************
 * Route get
 *****************************************************************************/

module.exports.getForSequences = function(req,res,next){
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
	var options = {where: [{ col:'set_id', val: req.params.setId }, 'and'] };
	options.where.push('(');
	req.params.sequenceId.split(',').forEach(function(id) {
		options.where.push({
			col: 'sequence_id',
			val: id
		});
		options.where.push('or')
	});
	if(options.where.length) options.where.pop(); // removing last or
	options.where.push(')');
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


/******************************************************************************
 * Route set mapping
 *****************************************************************************/

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
	var options = { where: [
		{ col: 'sequence_id', val: res.locals.sequence[0].id }, 
		'and', 
		{ col: 'sound_id', val: res.locals.sound[0].id },
		'and', 
		{ col: 'set_id', val: req.params.setId }
	] };
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
		set_id: req.params.setId
	})
	req.db.setAll(SequenceSoundMapping.ModelInfo, [mapping], function(err,result){
		if(err) return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		return done(null, mapping);
	});
}
