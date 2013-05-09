define([
	'SampleController'
],function(SampleController){
	function SoundFactory(buffers,context){

		this.context = context;
		this.samples = {};

		// // for now just create a single player
		var key;
		for(var soundKey in buffers){
			key = soundKey;
			break;
		}

		this.samples[key] = new SampleController(buffers[key],this.context.destination,this.context);

		this.playSound = function(data){
			if(this.samples[data.sound_key]){
				var played = this.samples[data.sound_key].play(data.x,data.y,data.z);
				if(!played) console.log('dropped sound for key: ' + data.sound_key);
			}
		};
	}

	return SoundFactory;
});