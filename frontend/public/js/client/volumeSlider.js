define([
	'jquery',
	'utils',
	'eventEmitter'
],function($,Util,EventEmitter){

	function VolumeSlider(selector){

		EventEmitter.call(this);

		this.$el = $(selector);
		this.$range = this.$el.children('input[type="range"]');
		this.$value = this.$el.children('#rangevalue');

		var self = this;
		this.$range.on('change',function(event){
			
			var val = self.$range.val();

			self.$value.val(val);
			self.emit('changed',val / 100);
		});
	}

	Util.inherits(VolumeSlider,EventEmitter);
	
	VolumeSlider.prototype.show = function(){
		this.$el.show();
	};

	return VolumeSlider;
});