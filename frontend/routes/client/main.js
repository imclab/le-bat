module.exports.index = function(req,res,next){
	res.locals.pagetitle = 'Le crazy social sound in realtime';
	res.render('client/landing');
};