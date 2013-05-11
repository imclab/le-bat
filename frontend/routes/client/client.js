var Sound = require('../../../model/Sound')

module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	// Use a hardcoded set of mappings and sounds for current
	// phase of development. This definitely has to be
	// replaced later!

	req.db.getAll(Sound.ModelInfo,null,function(err,result){
		if(err)
			return res.send(500, 'Internal Server Error');
		
		if(result.length){
			var mappings = {};
			var length = result.length < 8 ? result.length : 8;
			for(var i = 1; i < length; i++){
				mappings[i] = result[i].file_path;
			}
			res.locals.mappings = mappings;
			return res.render('client/listen');
		} else{
			return res.send(400, 'No sounds present! Please upload some!');
		}
	})
};