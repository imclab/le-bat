require.config({
	//baseUrl : '',
	paths : {
		'jquery' : '/js/libs/jquery/jquery-1.9.1.min',
		'plugins' : '/js/libs/require/plugins',
		'views' : '/js/views'
	}
});

require(['plugins/domReady', 'plugins/jade-runtime', 'app'],function(domReady, jadeRuntime, app){
	domReady(app.init);
});