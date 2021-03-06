define([
	'./mapping',
	'./sound'
],function(mapping, sounds){

	var exports = {};

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


	exports.addMappingToRow = function(sequenceId, sound) {
		var $row = $container.find('#sequence_'+sequenceId);
		var $player = $('<li>').append(sounds.createPlayer(sound));
		$row.find('.sequence-mappings').append($player);
		sounds.initPlayers($player);
	}


	// Get sound mappings for the table
	mapping.getMappingsFor(sequences, function(success, data) {
		if(!success || !data.sounds) return;
		var soundObjects = {};
		data.sounds.forEach(function(sound) { soundObjects[sound.id] = sound; });
		data.sequenceSoundMappings.forEach(function(mapping) {
			exports.addMappingToRow(mapping.sequence_id, soundObjects[mapping.sound_id]);
		});
	}) 

	return exports;
});
