
var express = require('express');


var APP = function(port){
    this.port = port;
    this.app = null;
};

APP.prototype = {
    start: function(callback){
        var app;
        this.app = app = express.createServer();
        
        
        app.configure(function(){
            app.use(express.static(process.cwd() + '/'));
        });

        app.listen(this.port);
        
        callback && callback();

    }
};



exports.APP = APP;