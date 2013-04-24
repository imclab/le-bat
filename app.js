var forever = require('forever-monitor');

var tweetServer = new(forever.Monitor)('server.js',{
    'silent': false        
    , 'max' : 1
    , 'minUptime': 3000      
    , 'spinSleepTime': 2000  
    , 'command': 'node'      
    , 'options': []          
    , 'sourceDir': './server'
});

tweetServer.on('start',function(process,data){
    console.log('TweetServer running on ' + data.pid);
});

tweetServer.on('exit',function(){
    console.log('Ooops! The TweetServer exited unexpectedly! Restarting...');
    tweetServer.start();
});

tweetServer.start();