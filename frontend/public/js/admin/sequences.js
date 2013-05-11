define([
	'./mapping',
	'./sound'
],function(mapping, sounds){

	var sequences = [];

	var $container = $('#sequences');

	var setBlocked = function($toggleGroup, blocked) {
		if(!blocked) {
			$toggleGroup.data('yes').removeClass('active').removeClass('btn-danger');
			$toggleGroup.data('no').addClass('active');
		} else {
			$toggleGroup.data('no').removeClass('active');
			$toggleGroup.data('yes').addClass('active').addClass('btn-danger');
		}
		$toggleGroup.data('value', blocked);
	}

	// Initialized rows for interactivity
	$container.find('.sequenceRow').each(function(){
		var $this = $(this);
		var $row = $this;

		sequences.push($row.data('id'));

		var $toggleGroup = $this.find('.blocked');
		$toggleGroup.data('yes', $toggleGroup.find('[name=yes]'));
		$toggleGroup.data('no', $toggleGroup.find('[name=no]'));
		$toggleGroup.data('current', 'no');

		$toggleGroup.find('.btn').click(function(){
			if($(this).attr('name') == $toggleGroup.data('current')) return;
			setBlocked($toggleGroup, !$toggleGroup.data('value'));
			$toggleGroup.data('current',$(this).attr('name'));
		});

		setBlocked($toggleGroup, $toggleGroup.data('value'));

		$this.find('[name=add-mapping]').click(function(){
			mapping.editForSequence($row.data('id'), $row.data('content'));
		});
	});

	// Get sound mappings for the table
	mapping.getMappingsFor(sequences, function(success, data) {
		if(!success) return;
		var soundObjects = {};
		data.sounds.forEach(function(sound) { soundObjects[sound.id] = sound; });
		data.sequenceSoundMappings.forEach(function(mapping) {
			var $row = $container.find('#sequence_'+mapping.sequence_id);
			var $player = $('<li>').append(sounds.createPlayer(soundObjects[mapping.sound_id]));
			$row.find('.sequence-mappings').append($player);
		});
		sounds.initPlayers($container);
	})



	return sequences;
});
