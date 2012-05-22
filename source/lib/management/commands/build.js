var fs = require('fs');
var utils = require('../utils');
var requirejs = require('requirejs');
var exec = require('child_process').exec;


var yuicompressor = __dirname + '/../../3rd/yuicompressor.jar';

var UFO_JS =  '/static/js/ufo.js';

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


var compileHtml = function(){
    var base_path = process.cwd() + '/',
    html_path = base_path + 'html/';
    
    var header = fs.readFileSync( html_path + 'header.html' );
    var footer = fs.readFileSync( html_path + 'footer.html' );

    var htmls = fs.readdirSync(html_path);
    
    var result = [];
    for (var i = 0; i < htmls.length; i += 1) {
        var file = htmls[i];
        if( file.indexOf( '.html' ) == -1 ) continue;
        
        if( file == 'header.html' || file == 'footer.html' ) continue;
        try{
            var body = fs.readFileSync( html_path + file );
            fs.writeFileSync( base_path + 'build/' + file , header + body + footer );
            result.push(file);
        }catch(e){
            utils.error('Compile html file ' + file + ' failed');
            continue;
        };
    }
    utils.success( 'Compile html files '+ result.join(',') + ' success' );
};


exports.run = function(params , options){
    options = options || {};

    utils.removeFolder('build');
    utils.createFolder('build');
    
    utils.processFolder(process.cwd() + '/build' , process.cwd() , ['static', 'build','app.json']);
    
    requirejs.optimize(confJs , function(res){
        utils.success('requirejs build js success.');
    });

    requirejs.optimize(confCss , function(res){
        utils.success('requirejs build css success.');
    });

    fs.writeFileSync( process.cwd() + '/build' + UFO_JS , fs.readFileSync(process.cwd() + UFO_JS) );
    
    compileHtml();
    
    
    if( options.compile ){
        exec( 'java -jar '+ yuicompressor +' --type js --charset utf-8 ' + confJs.out + ' -o ' + confJs.out  , function(error){
            if( !error ){
                utils.success('Compress javascript file success.');
            }else{
                utils.error('Error! '+ error);
            }
        });

        exec( 'java -jar '+ yuicompressor +' --type css --charset utf-8 ' + confCss.out + ' -o ' + confCss.out  , function(error){
            if( !error ){
                utils.success('Compress css file success.');
            }else{
                utils.error('Error! '+ error);
            }
        });
    }
};

