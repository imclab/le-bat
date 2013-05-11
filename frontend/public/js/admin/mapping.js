define([
	'../shared/page',
	'./sound'
],function(page, sound){

	var exports = {};

	var $container = $('#mapping');

	var $progressBar = $container.find('.bar');
	var $progressBarContainer = $container.find('.progressBarContainer');

	function showResponseInfo(success, message){
		page.showPageAlert(message, success ? 'success' : 'error');
		$progressBarContainer.hide();
	}


	exports.editForSequence = function(id, content) {
		$sequenceId = $container.find('[name=sequence_id]').val(id);
		$sequenceContent = $container.find('[name=sequence_content]').val(content);
		$soundSelect = $container.find('[name=sound_id]');

		$.get('/admin/sound/all', function(data) {
			$soundSelect = $container.find('[name=sound_id]').empty().append('<option value="null">-- Choose a sound --</option>');
			data.sounds.forEach(function(sound) {
				$soundSelect.append('<option value="'+sound.id+'">'+sound.name+'</option>');	
			});
		}, 'json')
		.fail(function(){
			showResponseInfo(false, 'Could not load initial data');
		})
		.done(function(){
			$.get('/admin/mapping/get/'+id, function(data) {
				if(data.sequenceSoundMappings) 
					$soundSelect.val(data.sounds[0].id);
				$soundSelect.removeAttr('disabled');
			},'json')
			.fail(function(){
				showResponseInfo(false, 'Could not load mappings');
			});
		})
	}


	$container.find('.submit').on('click',function(event){
		event.preventDefault();
		
		var self = $(this).button('loading');

		$progressBar.css('width','0%');
		$progressBarContainer.show();

		var $form = $('#mapping_form'); 
		var formData = new FormData($form.get(0));
		var xhr = new XMLHttpRequest();

		xhr.open($form.attr('method'), $form.attr('action'), true);

		xhr.upload.onprogress = function(e) {
      		if (e.lengthComputable) {
        		$progressBar.css('width', (e.loaded / e.total) * 100 + '%');
      		}
    	};

		xhr.onerror = function(e){
			showResponseInfo(false,'An error occured while submitting the form!');
			self.button('reset');
		};

		xhr.onload = function(){
			var success = this.status == 200;
			showResponseInfo(success, success ? 'Mapping submitted successfully' : this.response);
			if(!success) return self.button('reset');
			var sequenceSoundMapping = $.parseJSON(this.response);
			console.log(sequenceSoundMapping);
			//sound.addRow();
		};

		xhr.send(formData);
	});


	

	return exports;
});
