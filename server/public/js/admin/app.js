$(function(){

	var $progressBar = $('#progress_bar');
	var $progressBarContainer = $('#progress_bar_container');
	
	var $pageAlert = $('<div>').attr('class','page-alert').alert();
	var $pageAlertCloser = $('<a>')
		.attr({
			'class' : 'close'
			, 'data-dismiss' : 'alert'
			, 'href' : '#'
		})
		.text('x');

	function showUploadInfo(success,message){

		$pageAlert.empty();
		var $pageAlertText = $('<div>').appendTo($pageAlert);
		$pageAlertText.attr('class',success ? 'alert alert-success' : 'alert alert-error');
		$pageAlertText.text(message)
		$pageAlertCloser.appendTo($pageAlertText);
		
		$pageAlert.prependTo('body');
		$progressBarContainer.hide();
	}

	$('#submit_file').on('click',function(event){
		event.preventDefault();
		
		var self = $(this).button('loading');

		$progressBar.css('width','0%');
		$progressBarContainer.show();

		var formData = new FormData(document.getElementById('upload_form'));
		var xhr = new XMLHttpRequest();

		xhr.open('post','/sound',true);

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
			var success = this.status === 200;
			showUploadInfo(success,this.response);
			self.button('reset');
		};

		xhr.send(formData);
	});
});