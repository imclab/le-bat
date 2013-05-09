define([
	'jquery',
	'utils',
	'eventEmitter'
],function($,Util,EventEmitter){

	function VolumeSlider(selector){

		EventEmitter.call(this);

		this.$el = $(selector);

		var self = this;
		this.$el.on('change',function(event){
			var val = self.$el.val();
			self.emit('changed',val / 100);
		});
	}

	Util.inherits(VolumeSlider,EventEmitter);
	
	VolumeSlider.prototype.show = function(){
		this.$el.show();
	};

	return VolumeSlider;
});