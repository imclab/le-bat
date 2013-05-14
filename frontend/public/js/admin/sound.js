define([
	'../shared/page',
	'views/admin/soundRow',
	'views/admin/soundPlayer'
],function(page, soundRowJade, soundPlayerJade){

	var exports = {};

	var sounds = {};

	var currentlyPlayingTargets = {};

	var stop = function($target) {
		var $audio = $target.data('audio');
		var path = $audio.attr('src');
		$audio.get(0).pause();
		$audio.attr('src', '');

		setSoundButtonIcon($target, false);
		$target.data('playing', false);

		delete currentlyPlayingTargets[path];
	}

	var play = function($target) {
		var $audio = $target.data('audio');
		var path = $audio.data('path');

		if(currentlyPlayingTargets[path])
			stop(currentlyPlayingTargets[path]);

		$audio.attr('src', path).get(0).play();

		$target.data('playing', true);
		setSoundButtonIcon($target, true);

		currentlyPlayingTargets[path] = $target;
	}

	

	var setSoundButtonIcon = function($target, isPlaying) {
		if(!isPlaying) {
			$target.removeClass('btn-danger');
			$target.find('i').removeClass('iconic-stop').addClass('iconic-play');
		}
		else {
			$target.addClass('btn-danger');
			$target.find('i').removeClass('iconic-play').addClass('iconic-stop');
		}
	};

	exports.initPlayers = function(context) {
		$('.play', context).each(function(){
			var $this = $(this);
			var $audio = $this.parent().find('audio');

			$this.data('playing', false);
			$this.data('audio', $audio);

			$audio.on('error ended', function(){
				$this.data('playing', false);
				stop($this);
			});

		}).click(function() {
			var $this = $(this);

			if($this.data('playing')) stop($this);
			else play($this);
		});
	}


	exports.createPlayer = function(sound) {
		return $(soundPlayerJade({ sound: sound }));
	}

	
	exports.addRow = function(sound) {
		var $row = $(soundRowJade({sound: sound}));
		$('#soundTable tbody').prepend($row);
		exports.initPlayers($row);
	}


	exports.getByIds = function(soundIds, callback, scope) {
		var result = [];
		for(var i=soundIds.length-1; i>=0; --i)
			if(sounds[soundIds[i]]) {
				result.push(sounds[soundIds[i]]);
				soundIds.splice(i, 1);
			}
		if(soundIds.length == 0) return callback.call(scope, true, result);

		$.get('/admin/sound/get/'+soundIds.join(','), function(data) {
			if(data.sounds.length) 
				data.sounds.forEach(function(sound){
					result.push(sounds[sound.id] = sound);
				});
			callback.call(scope, true, result);
		},'json')
		.fail(function(jqXHR, textStatus, errorThrown){
			showResponseInfo(false, errorThrown);
		});
	}

	return exports;

});
