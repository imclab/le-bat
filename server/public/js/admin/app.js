$(function(){

	var $progressBar = $('#progress_bar');
	var $progressBarContainer = $('#progress_bar_container');
	var $uploadInfo = $('#upload_info');
	var $pageAlert = $('#page_alert').alert();

	function showUploadInfo(success,message){
		var cssClass = success ? 'alert alert-success' : 'alert alert-error';
		$uploadInfo.attr('class',cssClass);
		$uploadInfo.children('p').text(message);
		$pageAlert.show();
		$progressBarContainer.hide();
	}

	$('#submit_file').on('click',function(event){
		event.preventDefault();

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
		};

		xhr.onload = function(){
			var success = this.status === 200;
			showUploadInfo(success,this.response);
		};

		xhr.send(formData);
	});
});