var forever = require('forever-monitor');

var tweetServer = new(forever.Monitor)('server.js',{
    'silent': false        
    , 'max' : 1
    , 'minUptime': 3000      
    , 'spinSleepTime': 2000  
    , 'command': 'node'      
    , 'options': []          
    , 'sourceDir': './backend'
});

tweetServer.on('start',function(process,data){
    console.log('TweetServer running on ' + data.pid);
});

tweetServer.start();


var frontend = new(forever.Monitor)('server.js',{
    'silent': false        
    , 'max' : 1
    , 'minUptime': 3000      
    , 'spinSleepTime': 2000  
    , 'command': 'node'      
    , 'options': []          
    , 'sourceDir': './frontend'
});

frontend.on('start',function(process,data){
    console.log('Frontend running on ' + data.pid);
});

frontend.start();