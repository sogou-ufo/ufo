
if( process.argv.length > 2 &&  process.argv.indexOf('create') == -1 ){//非创建

    var fs = require('fs');
    var utils = require('./utils');

    var conf_path = process.cwd() + '/app.json';

    if( !fs.statSync( conf_path ).isFile() ){
        utils.error("Can't find app.json, make sure you are in the app directory." , '' , true);
    }

    var config = JSON.parse(fs.readFileSync( conf_path , 'utf8' ));

    exports.config = config;

}