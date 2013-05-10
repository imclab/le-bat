var fs = require('fs')
,	Sound = require('../../../model/Sound')
,	Tag = require('../../../model/Tag')
,	TagSoundMapping = require('../../../model/TagSoundMapping');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	req.db.getAll(Sound.ModelInfo, null, function(err, result) {
		if(err) return res.send(500, err);
		res.render('admin/index', {sounds: result});
	})
};