define([
	'./locator',
	'./websocketConnection',
	'./bufferLoader'
],function(Locator,WebsocketConnection,BufferLoader){

	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var locator, websocket, audioContext;

	function init(){
		if(navigator.geolocation){

			// first of all create audio context and access sound files
			audioContext = new webkitAudioContext();
			var bufferLoader = new BufferLoader(mappings,audioContext);

			bufferLoader.on('ready',function(buffers){

				locator = new Locator();
				locator.on('error',function(){

				});

				locator.on('ready',function(){
					websocket.connect();
				});

				websocket = new WebsocketConnection(wsUrl);

				websocket.on('data',function(data){
					console.log(data.sound_key);
				});

				websocket.on('close',function(){
					console.log('websocket closed');
				});

				locator.init();
			});

			bufferLoader.on('error',function(err){
				console.log(err);
			});

			bufferLoader.load();

		} else {
			// maybe give a more beautiful info here later
			alert('sorry but your browser does not support the geolocation API');
		}
	}

  	return {
  		init : init,
  		audioContext : audioContext
  	};
});