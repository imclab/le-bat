define([
	'./mapping'
],function(mapping){

	var sequences = {};

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

	$('.sequenceRow').each(function(){
		var $this = $(this);
		var $row = $this;
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
	})

	return sequences;
});
