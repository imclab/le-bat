define([
	'./locator',
	'./websocketConnection',
	'./bufferLoader'
],function(Locator,WebsocketConnection,BufferLoader){

	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var locator, websocket, audioContext;


	function init(){
		var isCompatible = testBrowserCompability();

		if(isCompatible){
			_initialize();
		} else{
			alert("Fuuu! Your browser can't do this");
		}
	}

	function testBrowserCompability(){
		if(!navigator.geolocation) return false;
		if(!window.webkitAudioContext) return false;
		if(!window.WebSocket) return false;
		
		return true;
	}

	function _initialize(){
		locator = new Locator();

		locator.on('error',function(err){
			console.log('could not locate you!');
			console.log(err);
		});

		locator.on('ready',function(){
			// load the buffers
			console.log('located successfully! Loading buffers...');
			bufferLoader.load();
		});
		
		audioContext = new webkitAudioContext();
		var bufferLoader = new BufferLoader(mappings,audioContext);

		bufferLoader.on('ready',function(buffers){
			console.log('successfully loaded and decoded buffers!')
			console.log(buffers)

			// connect to the websocket
			websocket.connect();
		});

		bufferLoader.on('error',function(err){
			console.log(err);
		});

		websocket = new WebsocketConnection(wsUrl);

		websocket.on('connected',function(){
			console.log('websocket connected successfully');
		});

		websocket.on('data',function(data){
			//console.log(data.sound_key);
		});

		websocket.on('close',function(){
			console.log('websocket closed');
		});

		// start everything by initializing the locator
		locator.init();
	}

  	return {
  		init : init
  	};
});