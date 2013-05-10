define([
],function(){

	var page = {};

	var $pageAlert = $('#page-alert');

	var createAlert = function(content, type, block, withCloseButton) {
		var $alert = $('<div>').addClass('alert').addClass('fade').addClass('in').alert();
		if(type) $alert.addClass('alert-'+type);
		if(block) $alert.addClass('alert-block');
		if(withCloseButton) $alert.append('<a href="#" class="close" data-dismiss="alert">&times;</a>');
		$alert.append(content);
		return $alert;
	}

	page.showPageAlert = function(content, type, block) {
		var $alert = createAlert(content, type, block, true);
		$pageAlert.append($alert);
	};

	return page;

});
