define([
	'positionSample'
],function(PositionSample){
	function SampleController(buffer,destination,context){

		this.destination = destination;
		this.context = context;
		this.players = {};
		this.current = 0;

		for(var i = 0; i < SampleController.queueLength; i++){
			this.players[i] = new PositionSample(buffer,this.destination,this.context);
		}
	}

	SampleController.prototype.play = function(x,y,z,when){
		this.current = this.current % SampleController.queueLength;
		var player = this.players[this.current];
		
		if(!player.isPlaying()){
			player.play(x,y,z,when);
			this.current++;
			return true;
		}
		return false;
	};

	SampleController.queueLength = 5;

	return SampleController;
});