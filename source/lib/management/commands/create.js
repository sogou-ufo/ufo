

var fs = require('fs');
var utils = require('../utils');

var assets_dir = __dirname + '/../../assets/'  ;

exports.usage = 'ufo create [module_name]';




exports.run = function(params , options){
    var pkg = params[0];
    var pwd = process.cwd() + '/' + pkg;
    
    utils.createFolder(pwd);

    utils.processFolder(pwd , assets_dir);
    
    utils.success('Create APP ' + pkg + ' success!' );
    
};

