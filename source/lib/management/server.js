
var utils = require('./utils');
var express = require('express');
var request = require('request');

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
        
        app.get(/\/(\w*\.html)$/ , function(req,res){
            var param = req.params;
            var file = process.cwd() + '/html/' + param;
            var path = utils.getApacheLocation(file);

            request.get(path).pipe(res);
        });


        app.get(/(.*)/ , function(req,res){
            var param = req.params;
            var file = process.cwd() + param;
            
            var path = utils.getApacheLocation(file) + '.php';
            
            request.get(path).pipe(res);
        });
        
        
        app.listen(this.port);
        
        callback && callback();

    }
};



exports.APP = APP;