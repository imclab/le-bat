var fs = require('fs')
,	formidable = require('formidable')
,	async = require('async')
,	Sound = require('../lib/sound/Sound')
,	Tag = require('../lib/mapping/Tag')
,	TagSoundMapping = require('../lib/mapping/TagSoundMapping');

module.exports.index = function(req,res,next){
	return res.render('admin/index');
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

		async.waterfall([
			function(done){
				return done(null,fields,file)
			}
			, validate
			, renameFile
			, saveSound
			, saveTags
		],function(err){
			if(err){
				// TODO: rewind changes on DB
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


function validate(fields,file,done){
	if(file.type != 'audio/mp3') return done({error : 'wrong filetype', httpCode : 415 , message : 'Given file was not a mp3!'});
	if(!fields.tags) return done({error : 'missing tags', httpCode : 400, message : 'File without tags! Did not save file on server'});

	return done(null,fields,file);
}


function renameFile(fields,file,done){
	var oldPath = './' + file.path;
	var extension = oldPath.substr(oldPath.lastIndexOf('.'));
	var newPath = './server/public/sounds/' + file.hash + extension;

	fs.rename(oldPath,newPath,function(err){
		if(err){
			return done({error : err, httpCode : 500, message : 'Could not save file due to an intenal error.'});
		}
		file.path = newPath;
		return done(null,fields,file,newPath);
	});
}

function saveSound(fields,file,filePath,done){
	var sound = Sound.fromObject({
		sha1 : file.hash
		, file_path : filePath
		, source : fields.source
		, license : fields.license
		, author : fields.author
	});
	// TODO: perform DB save query
	return done(null,fields,sound);
}

function saveTags(fields,sound,done){
	var tags = fields.tags.split(',');

	var asyncCounter = 0;
	for(var i = 0, length = tags.length; i < length; i++){

		saveTag(tags[i],sound.id,function(err){
			asyncCounter++;
			if(asyncCounter == tags.length){
				return done(null);
			}
		});
	}
}

function saveTag(name,soundId,done){
	var tag = new Tag(null,name);

	// TODO: perform DB save query for tag

	var tagSoundMapping = new TagSoundMapping(null,tag.id,soundId,0);

	// TODO: perform DB save query for TagSoundMapping
	var err = null;
	return done(null);
}
