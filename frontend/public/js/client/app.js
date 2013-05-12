define([
	'./locator',
	'./websocketConnection',
	'./bufferLoader',
	'./soundFactory',
	'./volumeSlider',
	'./progressBar'
],function(Locator,WebsocketConnection,BufferLoader,SoundFactory,VolumeSlider,ProgressBar){

	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var locator, websocket, audioContext, soundFactory;
	var progressBar, volumeSlider;
	var timerOffset = 5000, timerOffsetInterval, timerCountdown = 0;

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
		if(!(window.webkitAudioContext || window.AudioContext)) return false;
		if(!window.WebSocket) return false;
		
		return true;
	}

	function _initialize(){
		progressBar = new ProgressBar('#progress_container');

		locator = new Locator();

		locator.on('error',function(err){
			console.log('could not locate you!');
			console.log(err);
		});

		locator.on('ready',function(){
			// load the buffers
			console.log('located successfully! Loading buffers...');
			progressBar.tick(5);
			bufferLoader.load();
		});
		
		audioContext = window.webkitAudioContext ? new webkitAudioContext() : new AudioContext();
		var bufferLoader = new BufferLoader(mappings,audioContext);

		bufferLoader.on('ready',function(buffers){
			console.log('successfully loaded and decoded buffers!')
			soundFactory = new SoundFactory(buffers,audioContext,timerOffset);
			// connect to the websocket
			websocket.connect();
		});

		bufferLoader.on('progress',function(amount){
			progressBar.tickInterpolated(amount,60);
		});

		bufferLoader.on('error',function(err){
			console.log(err);
		});

		websocket = new WebsocketConnection(wsUrl);
	
		websocket.on('connected',function(){
			console.log('websocket connected successfully');

			timerOffsetInterval = setInterval(function(){

				timerCountdown++;
				var tickAmount = (1000 / (timerOffset - 2000)) * 100;
				if(!(tickAmount * timerCountdown <= 100)){
					progressBar.finish();
					volumeSlider.show();
					clearInterval(timerOffsetInterval);
				} else{
					progressBar.tickInterpolated(tickAmount,35);
				}

			},1000);
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

		volumeSlider = new VolumeSlider('.volumeSlider');

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