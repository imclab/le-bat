define([
	'app',
	'eventEmitter',
	'utils'
], function(App,EventEmitter,Utils){

	function BufferLoader(urls,context){
		
		EventEmitter.call(this);
		this.context = context;
		this.urlList = urls;
		this.amountOfUrls = Object.keys(this.urlList).length;
		this.loadCount = 0;
		this.bufferList = {};

		this.loadBuffer = function(url,soundKey){
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
						self.bufferList[soundKey] = buffer;
						if(++self.loadCount == self.amountOfUrls){
							self.emit('ready',self.bufferList);
						} else{
							console.log('decoded ' + self.loadCount + ' out of ' + self.amountOfUrls + ' buffers');
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
			for(var soundKey in this.urlList){
				this.loadBuffer(this.urlList[soundKey],soundKey);
			}
		};
	}

	Utils.inherits(BufferLoader,EventEmitter);

	return BufferLoader;
});