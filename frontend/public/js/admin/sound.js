define([
	'../shared/page',
	'views/admin/soundRow',
	'views/admin/soundPlayer'
],function(page, soundRowJade, soundPlayerJade){

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

	sounds.initPlayers = function(context) {
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


	sounds.createPlayer = function(sound) {
		return $(soundPlayerJade({ sound: sound }));
	}

	
	sounds.addRow = function(sound) {
		var $row = $(soundRowJade({sound: sound}));
		$('#soundTable tbody').append($row);
		sounds.initPlayers($row);
	}

	return sounds;

});
