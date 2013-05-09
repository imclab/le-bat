define([
	'./locator',
	'./websocketConnection',
	'./bufferLoader',
	'./soundFactory',
	'./volumeSlider'
],function(Locator,WebsocketConnection,BufferLoader,SoundFactory,VolumeSlider){

	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var locator, websocket, audioContext, soundFactory;
	var volumeSlider;

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
			soundFactory = new SoundFactory(buffers,audioContext);
			volumeSlider.show();
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
			var temp = locator.geoPositionToCartesian(data.location[0],data.location[1]);
			data.x = temp.x;
			data.y = temp.y
			data.z = temp.z;
			soundFactory.playSound(data);
		});

		websocket.on('close',function(){
			console.log('websocket closed');
		});

		volumeSlider = new VolumeSlider('#volume_slider');

		volumeSlider.on('changed',function(val){
			soundFactory.setVolume(val);
		});

		// start everything by initializing the locator
		locator.init();
	}

  	return {
  		init : init
  	};
});