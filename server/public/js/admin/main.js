require.config({
	//baseUrl : '',
	paths : {
		'jquery' : '/js/libs/jquery/jquery-1.9.1.min',
		'domReady' : '/js/libs/require/plugins/domReady'
	}
});

require(['domReady','app'],function(domReady,app){
	domReady(app.init);
});