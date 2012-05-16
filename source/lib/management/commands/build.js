var fs = require('fs');
var utils = require('../utils');
var requirejs = require('requirejs');
var exec = require('child_process').exec;

var confJs = {
    baseUrl: process.cwd() + '/static/js',
    name:"main",
    out:"build/static/js/main.js"
};

var confCss = {
    cssIn:"static/css/main.css",
    out:"build/static/css/main.css"
};

exports.usage = 'ufo build';


exports.options = [
    {
        'shortName' : 'c',
        'longName' : 'compile',
        'hasValue' : false
    }
];



exports.run = function(params , options){
    utils.removeFolder('build');
    utils.createFolder('build');
    
    utils.processFolder(process.cwd() + '/build' , process.cwd() , ['static', 'build','app.json']);
    
    requirejs.optimize(confJs , function(res){
        utils.success('requirejs build js success.');
    });

    requirejs.optimize(confCss , function(res){
        utils.success('requirejs build css success.');
    });
    
    
    if( options.compile ){
        exec( 'java -jar /etc/tools/yuicompressor.jar --type js --charset utf-8 ' + confJs.out + ' -o ' + confJs.out  , function(error){
            if( !error ){
                utils.success('Compress javascript file success.');
            }else{
                utils.error('Error! '+ error);
            }
        });

        exec( 'java -jar /etc/tools/yuicompressor.jar --type css --charset utf-8 ' + confCss.out + ' -o ' + confCss.out  , function(error){
            if( !error ){
                utils.success('Compress css file success.');
            }else{
                utils.error('Error! '+ error);
            }
        });
    }
};

