
var fs = require('fs');
var utils = require('../utils');
var server = require('../server');

var APP_JSON = 'app.json';

exports.usage = 'ufo start [port]\n';



exports.run = function(params , options){
    var root = process.cwd(),
    appconf = null,
    port = 8150;
    
    var conffile = root + '/' + APP_JSON;
    
    if( !fs.statSync( conffile ).isFile() ){
        utils.error("Can't find app.json, make sure you are in the app directory." , '' , true);
    }
    
    appconf = JSON.parse(fs.readFileSync( conffile , 'utf8' ));
    
    
    port = params[0] || appconf.port || port;
    
    var app = new server.APP(port);
    
    
    app.start(function(err){
        if (err) {
            utils.error('There was an error starting the application:\n');
            utils.error(err);
            console.log('\n');
            utils.error('UFO was not started!\n', null, true);
            return;
        }
        utils.success('\tUFO started' +
            ' on http://ufo:' + port );
    });
};

