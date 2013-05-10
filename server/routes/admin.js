var fs = require('fs')
,	formidable = require('formidable')
,	async = require('async')
,	_ = require('underscore')
,	Sound = require('../lib/sound/Sound')
,	Tag = require('../lib/mapping/Tag')
,	TagSoundMapping = require('../lib/mapping/TagSoundMapping');


module.exports.index = function(req,res,next){
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	req.db.getAll(Sound.ModelInfo, null, function(err, result) {
		if(err) return res.send(500, err);
		console.log(result);
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

		async.waterfall([
			function(done){
				return done(null,req,fields,file)
			}
			, validate
			, renameFile
			, saveSound
			, lookupTags
			, saveNewTags
			, saveTagSoundMappings
		],function(err){
			if(err){
				// TODO: rewind changes on DB
				// You can only rewind if you know where it got stuck..
				console.log(err.error);
				if(!file) return res.send(err.httpCode, err.message);
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
	if(!file) return done({error: 'missing file', httpCode: 400, message: 'No file supplied.'});
	if(file.type != 'audio/mp3') return done({error : 'wrong filetype', httpCode : 415 , message : 'Given file was not a mp3!'});
	if(!fields.name) return done({error : 'missing name', httpCode : 400, message : 'File without name! Did not save file on server'});
	if(!fields.tags) return done({error : 'missing tags', httpCode : 400, message : 'File without tags! Did not save file on server'});

	return done(null,req,fields,file);
}


function renameFile(req,fields,file,done){
	var oldPath = './' + file.path;
	var extension = oldPath.substr(oldPath.lastIndexOf('.'));
	var newPath = './server/public/sounds/' + file.hash + extension;

	fs.rename(oldPath,newPath,function(err){
		if(err){
			return done({error : err, httpCode : 500, message : 'Could not save file due to an internal error.'});
		}
		file.path = newPath;
		return done(null,req,fields,file,newPath);
	});
}

function saveSound(req,fields,file,filePath,done){
	if(true) // TODO: check if it was uploaded (and not on a different server for instance)
		filePath = filePath.replace('./server/public', ''); // store the path ready to download

	var sound = Sound.fromObject({
		id: null
		, name : fields.name
		, sha1 : file.hash
		, file_path : filePath
		, source : fields.source
		, license : fields.license
		, author : fields.author
	});

	if(!req.db || !req.db.ready) 
		return done({error: 'Database not available', httpCode: 500, message: 'Database not available'});

	req.db.setAll(Sound.ModelInfo, [sound], function(err, result) {
		if(err) 
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		
		sound.id = result.insertId;
		return done(null,req,fields,sound);
	});
}

function lookupTags(req,fields,sound,done){
	var tagNames = _.uniq(fields.tags.split(','));
	var queryOptions = { where : [] };
	var tags = {};
	var tagSoundMappings = [];
	var name;

	// build the query options and create an object
	// for checking which tags are new later
	for(var i = 0, length = tagNames.length; i < length; i++){
		if(i != 0)
			queryOptions.where.push('or');

		name = tagNames[i];
		tags[name] = undefined;
		queryOptions.where.push({ col : 'name', val : name });
	}

	// send query
	req.db.getAll(Tag.ModelInfo,queryOptions,function(err,result){
		if(err) 
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		

		for(var i = 0, length = result.length; i < length; i++){
			tagSoundMappings.push(new TagSoundMapping(null,result[i].id,sound.id,0)); // create a new mapping
			delete tags[result[i].name]; // no new tag -> delete it
		}
		return done(null,req,sound,tags,tagSoundMappings);
	});
}

function saveNewTags(req,sound,tags,tagSoundMappings,done){
	var newTags = [];
	for(var name in tags){
		newTags.push(new Tag(null,name));
	}
	req.db.setAll(Tag.ModelInfo,newTags,function(err,result){
		if(err)
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});

		// access ids and create mappings
		for(var i = result.insertId; i < result.insertId + result.affectedRows; i++){
			tagSoundMappings.push(new TagSoundMapping(null,i,sound.id,0));
		}
		return done(null,req,tagSoundMappings);
	});
}

function saveTagSoundMappings(req,mappings,done){
	req.db.setAll(TagSoundMapping.ModelInfo,mappings,function(err,result){
		if(err)
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		
		return done(null);
	});
}
