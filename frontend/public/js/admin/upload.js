define([
	'../shared/page',
	'./sound'
],function(page, sound){

	var $progressBar = $('#progress_bar');
	var $progressBarContainer = $('#progress_bar_container');

	function showUploadInfo(success,message){
		page.showPageAlert(message, success ? 'success' : 'error');
		$progressBarContainer.hide();
	}

	$('#submit_file').on('click',function(event){
		event.preventDefault();
		
		var self = $(this).button('loading');

		$progressBar.css('width','0%');
		$progressBarContainer.show();

		var $form = $('#upload_form'); 
		var formData = new FormData($form.get(0));
		var xhr = new XMLHttpRequest();

		xhr.open($form.attr('method'), $form.attr('action'), true);

		xhr.upload.onprogress = function(e) {
      		if (e.lengthComputable) {
        		$progressBar.css('width', (e.loaded / e.total) * 100 + '%');
      		}
    	};

		xhr.onerror = function(e){
			showUploadInfo(false,'An error occured while submitting the file!');
			self.button('reset');
		};

		xhr.onload = function(){
			var success = this.status == 200;
			showUploadInfo(success, success ? 'File uploaded successfully' : this.response);
			sound.addRow($.parseJSON(this.response));
			self.button('reset');
		};

		xhr.send(formData);
	});

});
