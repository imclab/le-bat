var async = require('async')
,	SequenceSoundSet = require('../../../model/SequenceSoundSet');

module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready)
		return res.send(500, 'Database not available');

	async.waterfall([
		function(done){
			done(null,req,res);
		}
		, getSets
	], function(err){
		res.locals.pagetitle = 'Le social sound';
		res.locals.sets = [];
		res.render('client/landing');
	});
};

function getSets(req,res,done){
	req.db.getAll(SequenceSoundSet.ModelInfo,{ order : [{col : 'updated' , desc : true}] , limit : {count : 10} }, function(err, result) {
		if(err) return res.send(500, err);
		done(null, req, result);
	});
}

function populateSetsWithNames(){

}