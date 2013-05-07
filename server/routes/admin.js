var fs = require('fs')
,	formidable = require('formidable')
,	async = require('async')
,	Sound = require('../lib/sound/Sound')
,	Tag = require('../lib/mapping/Tag')
,	TagSoundMapping = require('../lib/mapping/TagSoundMapping');

module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	req.db.getAll(Sound.ModelInfo, null, function(err, result) {
		if(err) return res.send(500, err);
		res.render('admin/index', {sounds: result});
	})
};

module.exports.uploadSound = function(req,res,next){

	var form = new formidable.IncomingForm;
	form.keepExtensions = true;
	form.uploadDir = './server/public/sounds';
	form.hash = "sha1";

	form.parse(req,function(err,fields,files){
		if(err){
			console.log(err);
			return res.send('An error occured while transmitting the file.');
		}

		var file = files.sound;
		console.log(file);
		async.waterfall([
			function(done){
				return done(null,req,fields,file)
			}
			, validate
			, renameFile
			, saveSound
			, saveTags
		],function(err){
			if(err){
				// TODO: rewind changes on DB
				// You can only rewind if you know where it got stuck..
				console.log(err.error);
				fs.unlink(file.path,function(unlinkErr){
					if(unlinkErr) console.log(unlinkErr);
					return res.send(err.httpCode,err.message);
				});
			} else{
				return res.send(200,'File uploaded successfully');
			}
		});
	});
};


function validate(req,fields,file,done){
	if(file.type != 'audio/mp3') return done({error : 'wrong filetype', httpCode : 415 , message : 'Given file was not a mp3!'});
	if(!fields.tags) return done({error : 'missing tags', httpCode : 400, message : 'File without tags! Did not save file on server'});

	return done(null,req,fields,file);
}


function renameFile(req,fields,file,done){
	var oldPath = './' + file.path;
	var extension = oldPath.substr(oldPath.lastIndexOf('.'));
	var newPath = './server/public/sounds/' + file.hash + extension;

	fs.rename(oldPath,newPath,function(err){
		if(err){
			return done({error : err, httpCode : 500, message : 'Could not save file due to an intenal error.'});
		}
		file.path = newPath;
		return done(null,req,fields,file,newPath);
	});
}

function saveSound(req,fields,file,filePath,done){
	if(true) // TODO: check if it was uploaded (and not on a different server for instance)
		filePath = filePath.replace('./server/public', ''); // store the path ready to download
	var sound = Sound.fromObject({
		sha1 : file.hash
		, file_path : filePath
		, source : fields.source
		, license : fields.license
		, author : fields.author
	});
	// TODO: perform DB save query
	if(!req.db || !req.db.ready) 
		return done({error: 'Database not available', httpCode: 500, message: 'Database not available'})

	req.db.setAll(Sound.ModelInfo, [sound], function(err, result) {
		if(err) 
			return done({error : err, httpCode : 500, message : 'Could not save information to databse due to an intenal error.'});
		console.log(result);
		return done(null,req,fields,sound);
	})
}

function saveTags(req,fields,sound,done){
	var tags = fields.tags.split(',');

	var asyncCounter = 0;
	for(var i = 0, length = tags.length; i < length; i++){

		saveTag(req,tags[i],sound.id,function(err){
			asyncCounter++;
			if(asyncCounter == tags.length){
				return done(null);
			}
		});
	}
}

function saveTag(req,name,soundId,done){
	var tag = new Tag(null,name);

	// TODO: perform DB save query for tag

	var tagSoundMapping = new TagSoundMapping(null,tag.id,soundId,0);

	// TODO: perform DB save query for TagSoundMapping
	var err = null;
	return done(null);
}
