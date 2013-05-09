define([
	'SampleController'
],function(SampleController){
	function SoundFactory(buffers,context){

		this.context = context;

		// create a master gain node
		this.mix = this.context.createGainNode();
		this.mix.gain.value = 0.8;

		// create a master dynamic compressor
		this.compressor = context.createDynamicsCompressor();

		// hookup gain to the compressor
		this.mix.connect(this.compressor);

		// connect the compressor to the final output
		this.compressor.connect(this.context.destination);

		this.samples = {};

		for(var soundKey in buffers){
			this.samples[soundKey] = new SampleController(buffers[soundKey],this.mix,this.context);
		}
	}

	SoundFactory.prototype.playSound = function(data){
		if(this.samples[data.sound_key]){
			var played = this.samples[data.sound_key].play(data.x,data.y,data.z);
			if(!played) console.log('dropped sound for key: ' + data.sound_key);
		}
	};

	SoundFactory.prototype.setVolume = function(val){
		console.log(val);
		this.mix.gain.value = val;
	};

	return SoundFactory;
});