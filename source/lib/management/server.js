
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
            var html_dir = process.cwd() + '/html/';
            
            
            try{
                res.header('Content-type' , 'text/html');
                var body = fs.readFileSync( html_dir + param );
                
                var header = fs.readFileSync( html_dir + 'header.html' );
                var footer = fs.readFileSync( html_dir + 'footer.html' );

                res.send( header + body + footer );
                
            }catch(e){
                try{
                    res.header('Content-type' , 'text/html');
                    var body = fs.readFileSync( process.cwd() + '/' + param );
                    
                    res.send( body);
                }catch(e){
                    res.send(404);
                }
            }
        });


        app.get(/\/(\w*\.o)$/ , function(req,res){ //php file
            var param = req.params;
            var file = process.cwd() + '/' + param;
            
            var url = utils.getApacheLocation(file) ;

            var path = url.path + 'phpd/' + url.file.replace('.o' , '.php');
            
            request.get(path).pipe(res);
        });
        
        if( appconf.rewrite ){
            for( var reg in appconf.rewrite ){
                app.get( new RegExp(reg) , function(reg){
                    return function( req , res){
                        var url = appconf.rewrite[reg];
                        utils.log('Rewrite ' + reg + ' to ' + url );
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