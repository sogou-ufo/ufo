
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
        var app , port = this.port;
        this.app = app = express.createServer();
        
        app.on('error',function(error){
            if( error.errno == 'EADDRINUSE' ){
                utils.error('Server start failed. Try use other port.' , 'ufo start 8888' , true);
            }
        });
        
        app.on('listening',function(error){
            utils.success('\tUFO started' +
                          ' on http://'+ (appconf.domain || 'ufo') +':' + port );
        });

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


        app.get(/\/(\w*\.php)$/ , function(req,res){ //php file
            var param = req.params;
            var file = process.cwd() + '/' + param;
            
            var url = utils.getApacheLocation(file) ;

            var path = url.path + 'phpd/' + url.file;
            
            request.get(path).pipe(res);
        });

        app.get(/^\/$/ , function(req,res){ //php file
            var html_dir = process.cwd() + '/html/';
            
            var htmls = fs.readdirSync(html_dir);
            var html = '',
            tpl = '<p><a href="{file}">{file}</a></p>';
            htmls.forEach(function(item){
                if( ['header.html' , 'footer.html'].indexOf(item) != -1 ) return;
                html += tpl.replace(/{file}/g , item);
            });

            res.header('Content-type' , 'text/html');
            res.send( html );

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