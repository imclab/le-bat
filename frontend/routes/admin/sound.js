var fs = require('fs')
,	formidable = require('formidable')
,	async = require('async')
,	_ = require('underscore')
,	Sound = require('../../../model/Sound')
,	Tag = require('../../../model/Tag')
,	TagSoundMapping = require('../../../model/TagSoundMapping');


module.exports.get = function(req,res,next) {
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	var options = {where: []};
	req.params.soundId.split(',').forEach(function(id) {
		options.where.push({
			col: 'id',
			val: id
		});
		options.where.push('or')
	});
	if(options.where.length) options.where.pop(); // removing last or

	req.db.getAll(Sound.ModelInfo, options, function(err, result) {
		if(err) return res.send(500, err);
		res.send(200, JSON.stringify({sounds: result}));
	})
}



module.exports.getAll = function(req,res,next) {
	if(!req.db || !req.db.ready) 
		return res.send(500, 'Database not available');

	req.db.getAll(Sound.ModelInfo, null, function(err, result) {
		if(err) return res.send(500, err);
		res.send(200, JSON.stringify({sounds: result}));
	})
}



var publicDir = './frontend/public';
var tempDir = publicDir + '/tmp';
var soundsDir = publicDir + '/sounds';

module.exports.upload = function(req,res,next){

	var form = new formidable.IncomingForm;
	form.keepExtensions = true;
	form.uploadDir = tempDir;
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
		],function(err,sound){
			if(err){
				// TODO: rewind changes on DB
				// You can only rewind if you know where it got stuck..
				console.log(err.error);
				if(!file) return res.send(err.httpCode, err.message);
				rollbackFs([file.path])
				return res.send(err.httpCode,err.message);
			} else{
				return res.send(200, JSON.stringify(sound));
			}
		});
	});
};

function rollbackFs(paths) {
	paths.forEach(function(path){
		fs.unlink(path,function(unlinkErr){
			if(unlinkErr) console.log(unlinkErr);
		});
	})
}

function validate(req,fields,file,done){
	if(!file || (!file.size && !file.name)) return done({error: 'missing file', httpCode: 400, message: 'No file supplied.'});
	if(!req.ffmpeg && file.type != 'audio/mp3') return done({error : 'wrong filetype', httpCode : 415 , message : 'Given file was not a mp3 and there is no ffmpeg to convert it to mp3!'});
	if(!fields.name) return done({error : 'missing name', httpCode : 400, message : 'File without name! Did not save file on server'});
	if(!fields.tags) return done({error : 'missing tags', httpCode : 400, message : 'File without tags! Did not save file on server'});

	return done(null,req,fields,file);
}


function renameFile(req,fields,file,done){
	var oldPath = './' + file.path;
	var newPath = soundsDir + '/' + file.hash + '.mp3';

	if(!req.ffmpeg) {
		fs.rename(oldPath,newPath,function(err){
			if(err){
				rollbackFs([oldPath]);
				return done({error : err, httpCode : 500, message : 'Could not save file due to an internal error.'});
			}
			file.path = newPath;
			return done(null,req,fields,file,newPath);
		});
	} else {
		var tempPath = tempDir + '/' + file.hash + '_.mp3';
		var proc = require('child_process').spawn(req.ffmpeg.bin, ['-n', '-i', oldPath, '-ab', req.ffmpeg.bitrate, tempPath]);
		var err = '';
		proc.stderr.on('data', function(data) { err += data.toString(); });
		proc.on('close', function(code) {
			if(code) return done({error: err, httpCode: 500, message: 'FFmpeg failed: ' + err});
			var newHash = require('crypto').createHash('sha1');
			var stream = fs.createReadStream(tempPath, { encoding: 'binary' });
			stream.addListener('data', function(chunk) { newHash.update(chunk); });
			stream.addListener('close', function() {
				var digest = newHash.digest('hex');
				newPath = soundsDir + '/' + digest + '.mp3';
				if(fs.existsSync(newPath)) {
					rollbackFs([oldPath, tempPath]);
					return done({error: err, httpCode: 400, message: 'File already exists'});
				}
				fs.rename(tempPath, newPath, function(err) {
					if(err) {
						rollbackFs([oldPath, tempPath]);
						return done({error : err, httpCode : 500, message : 'Could not save file due to an internal error.'});
					}
					rollbackFs([oldPath]);
					file.path = newPath;
					file.hash = digest;
					return done(null,req,fields,file,newPath);
				})
			})
		})

	}
	
}

function saveSound(req,fields,file,filePath,done){
	if(true) // TODO: check if it was uploaded (and not on a different server for instance)
		filePath = filePath.replace(publicDir, ''); // store the path ready to download

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
		return done(null,req,sound,tagSoundMappings);
	});
}

function saveTagSoundMappings(req,sound,mappings,done){
	req.db.setAll(TagSoundMapping.ModelInfo,mappings,function(err,result){
		if(err)
			return done({error : err, httpCode : 500, message : 'Could not save information to database due to an intenal error.'});
		
		return done(null,sound);
	});
}
