module.exports.index = function(req,res,next){
	return res.render('admin/index');
};

module.exports.update = function(req,res,next){
	console.log(req.body);
	return res.send(200);
};