define([
	'./locator',
	'./websocketConnection'
],function(Locator,WebsocketConnection){

	var wsUrl = 'ws://' + settings.host + ':' + settings.websocket.port;
	var locator, websocket;

	function init(){

		locator = new Locator();
		locator.on('error',function(){

		});

		locator.on('ready',function(){
			//websocket.connect();
			//console.log(locator.calcDistanceAndBearing(38.897147,-77.043934));
		});

		websocket = new WebsocketConnection(wsUrl);

		websocket.on('data',function(data){
			console.log(data);
		});

		websocket.on('close',function(){
			console.log('websocket closed');
		});

		locator.init();
	}

  	return {
  		init : init,
  		locator : locator,
  		websocket : websocket
  	};
});