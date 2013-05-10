require.config({
	//baseUrl : '',
	paths : {
		'jquery' : '/js/libs/jquery/jquery-1.9.1.min',
		'plugins' : '/js/libs/require/plugins'
	}
});

require(['plugins/domReady','app'],function(domReady,app){
	domReady(app.init);
});