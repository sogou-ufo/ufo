
var utils = require('./utils');
var express = require('express');
var request = require('request');
var fs = require('fs');

var appconf = require('./conf').config;

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
        
        app.get(/\/(\w*\.html)$/ , function(req,res){ //html file
            var param = req.params;
            var file = process.cwd() + '/html/' + param;
            
            res.header('Content-type' , 'text/html');
            res.send( fs.readFileSync(file) );
        });


        app.get(/\/(\w*\.o)$/ , function(req,res){ //php file
            var param = req.params;
            var file = process.cwd() + '/' + param;
            
            var url = utils.getApacheLocation(file) ;

            var path = url.path + url.file.replace('.o' , '.php');
            
            request.get(path).pipe(res);
        });
        
        if( appconf.rewrite ){
            for( var reg in appconf.rewrite ){
                app.get( /(\w*)$/ , function(reg){
                    return function( req , res){
                        var url = appconf.rewrite[reg];
                        request.get(url).pipe(res);
                    };
                }(reg) );
            }
        }
        
        
        app.listen(this.port);
        
        callback && callback();

    }
};



exports.APP = APP;