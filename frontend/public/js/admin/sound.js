define([
	'../shared/page'
],function(page){

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

	$('.play').each(function(){
		var $this = $(this);
		var $audio = $this.parent().find('audio');

		$this.data('playing', false);
		$this.data('audio', $audio);

		$audio.on('error ended', function(){
			$this.data('playing', false);
			setSoundButtonIcon(target, false);
		});

	}).click(function() {
		var $this = $(this);
		var $audio = $this.data('audio');
		var isPlaying = $this.data('playing');

		if(isPlaying) $audio.get(0).pause();
		else $audio.get(0).play();

		$this.data('playing', isPlaying = !isPlaying);

		setSoundButtonIcon($this, isPlaying);
	});

});
