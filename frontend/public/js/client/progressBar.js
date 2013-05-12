define([
	'jquery'
],function($,utils){

	function ProgressBar(selector){

		this.$container = $(selector);
		this.$progress = this.$container.children('.progress').children('#progress_bar');
		this.$loaderHeader = this.$container.children('h2');
		this.currentPercentage = 0;
	}

	ProgressBar.prototype.tick = function(percentage){

		percentage = percentage || 1;
		this.currentPercentage += percentage;
		this._setValue();
	};

	ProgressBar.prototype.tickInterpolated = function(value,max){
		this.currentPercentage += this._interpolate(value,max);
		this._setValue();
	};

	ProgressBar.prototype.finish = function(){
		this.currentPercentage = 100;
		this._setValue();
		this.$container.hide();
	};

	ProgressBar.prototype._interpolate = function(value,max){

    	var valueScaled = value / 100;
    	return valueScaled * max;
	};

	ProgressBar.prototype._setValue = function(){
		this.$loaderHeader.text('Loading....... ' + ~~(this.currentPercentage) + '%');
		this.$progress.css('width',this.currentPercentage + '%');
	};

	return ProgressBar;
});