var async = require('async')
,	SequenceSoundSet = require('../../../model/SequenceSoundSet')
,	User = require('../../../model/user');

module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready)
		return res.send(500, 'Database not available');

	async.waterfall([
		function(done){
			done(null,req,res);
		}
		, getSets
		, populateSetsWithNames
	], function(err){
		res.locals.pagetitle = 'Le social sound';
		res.render('landing/landing');
	});
};

function getSets(req,res,done){
	req.db.getAll(SequenceSoundSet.ModelInfo,{ order : [{col : 'updated' , desc : true}] , limit : {count : 10} }, function(err, result) {
		if(err) return res.send(500, err);
		res.locals.sets = result;
		done(null, req, res);
	});
}

function populateSetsWithNames(req,res,done){
	var options = { where: [] };
	res.locals.sets.forEach(function(set) {
		options.where.push({
			col: 'id',
			val: set.user_id
		});
		options.where.push('or');
	});
	options.where.pop();

	req.db.getAll(User.ModelInfo,options,function(err,result){
		if(err) return res.send(500,err);
		res.locals.users = {};
		result.forEach(function(user){
			res.locals.users[user.id] = User.strippedFromObject(user);
		});
		return done(null);
	});
}