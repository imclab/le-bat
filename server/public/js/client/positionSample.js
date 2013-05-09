define([
],function(){

	function PositionSample(buffer,destination,context){

		this.buffer = buffer;
		this.context = context;

		// create a PannerNode and connect it to the given
		// destination
		this.panner = context.createPanner();
		this.panner.maxDistance = 25;
		this.panner.panningModel = 'HRTF';
		this.panner.distanceModel = 'exponential';
		this.panner.connect(destination);

	}

	PositionSample.prototype.play = function(x,y,z){

		x = x * 25;
		z = z * 25;

		// create a AudioBufferSourceNode from the given buffer
		// this might sound inefficient but it's actually the
		// way to do it.
		// 
		// a more official statement can be found here:
		// http://updates.html5rocks.com/2012/01/Web-Audio-FAQ

		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;

		// connect the buffer to the panner
		this.source.connect(this.panner);
		
		// set the panner's position to the given coordinates
		this.panner.setPosition(x,y,z);

		// set the panner's position so it points to (0,0,0)
		this.panner.setOrientation(-x,-y,-z);

		this.source.start(0);
	};

	PositionSample.prototype.isPlaying = function(){

		// check if we actually ever played a sound
		if(!this.source) return false;
		// check if our AudioBufferSource is done playing
		if(this.source.playbackState == 3) return false;
		// we are free
		return true;
	}

	return PositionSample;
});