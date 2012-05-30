
var fs = require('fs');

var conf_path = process.cwd() + '/app.json';
    
var config = JSON.parse(fs.readFileSync( conf_path , 'utf8' ));

exports.config = config;

