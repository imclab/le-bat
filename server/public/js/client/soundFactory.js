define([
	'SampleController'
],function(SampleController){
	function SoundFactory(buffers,context){

		this.context = context;

		// create a master gain node
		this.mix = this.context.createGainNode();

		// create a master dynamic compressor
		this.compressor = context.createDynamicsCompressor();

		// hookup gain to the compressor
		this.mix.connect(this.compressor);

		// connect the compressor to the final output
		this.compressor.connect(this.context.destination);

		this.samples = {};

		// // for now just create a single player
		var key;
		for(var soundKey in buffers){
			key = soundKey;
			break;
		}

		this.samples[key] = new SampleController(buffers[key],this.compressor,this.context);

		this.playSound = function(data){
			if(this.samples[data.sound_key]){
				var played = this.samples[data.sound_key].play(data.x,data.y,data.z);
				if(!played) console.log('dropped sound for key: ' + data.sound_key);
			}
		};
	}

	return SoundFactory;
});