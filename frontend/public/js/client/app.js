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

	var sequenceSoundMappingsById = {};
	settings.sequenceSoundSet.mappings.forEach(function(mapping) {
		sequenceSoundMappingsById[mapping.id] = mapping;
	});

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
		var bufferLoader = new BufferLoader(settings.sequenceSoundSet, audioContext);

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
			
			websocket.send({sequenceSoundSet: settings.sequenceSoundSet.set.id });

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
			var delay = 0;
			data.sequenceSoundIds.forEach(function(id) {
				if(sequenceSoundMappingsById[id]) {
					var temp = locator.geoPositionToCartesian(data.location[0],data.location[1]);
					var playConfig = {
						soundId: sequenceSoundMappingsById[id].sound_id
						, x: temp.x
						, y: temp.y
						, z: temp.z
						, timestamp: data.timestamp + ~~(Math.random() * 1000) // Our data currently gives full seconds
					}
					soundFactory.playSound(playConfig, delay);
					delay += 500;
				}
			});
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