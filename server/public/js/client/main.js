require.config({
	//baseUrl : '',
	paths : {
		'domReady' : '/js/libs/require/plugins/domReady'
	}
});

require(['domReady','app'],function(domReady,app){
	domReady(app.init);
});