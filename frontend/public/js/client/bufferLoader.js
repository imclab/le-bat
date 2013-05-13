define([
	'app',
	'eventEmitter',
	'utils'
], function(App,EventEmitter,Utils){

	function BufferLoader(sequenceSoundSet,context){
		
		EventEmitter.call(this);
		
		this.context = context;

		this.urlList = {};
		sequenceSoundSet.sounds.forEach(function(sound) {
			this.urlList[sound.id] = sound.file_path;
		}, this);

		this.amountOfUrls = Object.keys(this.urlList).length;
		this.loadCount = 0;
		this.bufferList = {};

		this.loadBuffer = function(url,soundId){
			var request = new XMLHttpRequest();
			request.open('GET',url,true);
			request.responseType = 'arraybuffer';

			var self = this;

			request.onload = function(){
				self.context.decodeAudioData(request.response
					,function(buffer){
						if(!buffer){
							self.emit('error','Could not decode audio file: ' + url);
							return;
						}
						self.bufferList[soundId] = buffer;
						if(++self.loadCount == self.amountOfUrls){
							self.emit('ready',self.bufferList);
						} else{
							self.emit('progress',100 / self.amountOfUrls);
						}
					}
					,function(err){
						self.emit('error','decodeAudio error: ' + err);
					}
				);
			};

			request.error = function(){
				self.emit('error','XHR error while fetching file: ' + url);
			};

			request.send();
		};

		this.load = function(){
			for(var soundId in this.urlList){
				this.loadBuffer(this.urlList[soundId],soundId);
			}
		};
	}

	Utils.inherits(BufferLoader,EventEmitter);

	return BufferLoader;
});