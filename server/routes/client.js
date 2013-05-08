var Sound = require('../lib/sound/Sound');

module.exports.landing = function(req,res,next){
	res.locals.pagetitle = 'Le crazy social sound in realtime';
	res.render('client/landing');
}

module.exports.listen = function(req,res,next){
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
			for(var i = 1; i < 6; i++){
				mappings[i] = result[0].file_path;
			}
			res.locals.mappings = mappings;
			return res.render('client/listen');
		} else{
			return res.send(400, 'No sounds present! Please upload some!');
		}
	})
};