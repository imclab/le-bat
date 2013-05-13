define([
	'SampleController'
],function(SampleController){
	function SoundFactory(buffers,context,offset){

		this.scheduleOffset = offset || 5000;
		this.context = context;

		// create a master gain node
		// API changed a bit -> make sure to support old API
		// implementations with the if

		this.mix = this.context.createGain ? this.context.createGain() : this.mix = this.context.createGainNode();
		this.mix.gain.value = 0.7;

		// create a master dynamic compressor
		this.compressor = context.createDynamicsCompressor();

		// hookup gain to the compressor
		this.mix.connect(this.compressor);

		// connect the compressor to the final output
		this.compressor.connect(this.context.destination);

		this.samples = {};

		for(var soundId in buffers){
			this.samples[soundId] = new SampleController(buffers[soundId],this.mix,this.context);
		}
	}

	SoundFactory.prototype.playSound = function(data, delay){

		var scheduleTime = data.timestamp + delay;
		scheduleTime = scheduleTime - (+new Date) + this.scheduleOffset;
		scheduleTime = scheduleTime / 1000; // to seconds for audio scheduling

		if(this.samples[data.soundId]){
			var played = this.samples[data.soundId].play(data.x,data.y,data.z,scheduleTime);
			if(!played) console.log('dropped sound for key: ' + data.soundId);
		}
	};

	SoundFactory.prototype.setVolume = function(val){
		this.mix.gain.value = val;
	};

	return SoundFactory;
});