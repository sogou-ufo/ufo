var fs = require('fs');
var utils = require('../utils');
var requirejs = require('requirejs');
var exec = require('child_process').exec;
var crypto = require('crypto');


var yuicompressor = __dirname + '/../../3rd/yuicompressor.jar';

var UFO_JS =  '/static/js/ufo.js';

var confJs = {
    baseUrl: process.cwd() + '/static/js',
    name:"main",
    out:"build/static/js/main.js",
    optimize:"none"
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
    },
    {
        "shortName": "p",
        "longName": "publish",
        "hasValue": false
    },
    {
        "shortName":"s",
        "longName":"single",
        "hasValue":false
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

var getTimestamp = function(file){
    var md5 = crypto.createHash('md5');
    md5.update(fs.readFileSync(file ));
    var result = md5.digest('hex');
    result = [result.slice(0,16) , result.slice(16)];
    var f = '';
    result.forEach(function(item){
        var num = (parseInt( item , 16 ) % 997).toString();
        while( num.length < 3 ){
            num = '0' + num;
        }
        f += num;
    });
    return f;
};

var compileTimestamp = function(){
    exec("for i in `find build/ -name '*.css' -o -name '*.js' -o -name '*.html'`;do dos2unix $i;done" , function(){
    

        var cssMain = process.cwd() + '/build/static/css/main.css';
        var cssToken = /url\(['"]?(.*?)['"]?\)/g , cr;
        var cssFile = fs.readFileSync( cssMain ).toString();
        while( ( cr=cssToken.exec(cssFile) ) != null ){
            var img = cr[1];
            if( img.indexOf('http') == 0 ) continue;//online image will not compile
            img = process.cwd() + '/build/static/css/' + img;
            var tm = getTimestamp(img);
            cssFile = cssFile.replace( cr[1] , cr[1] +'?t='+tm );
        }
        fs.writeFileSync( cssMain , cssFile );
        
        

        var tplFolder = process.cwd() + '/tpl/';
        
        try{
            var tpls = fs.readdirSync(tplFolder);

            var token = /(?:href|src)=['"](.*)\?t=(\d+|@date@)['"]/g , result;
            tpls.forEach(function(tpl){
                var file = fs.readFileSync(tplFolder + tpl);
                file = utils.decode(file);
                while( (result = token.exec(file)) != null ){
                    var target_file = process.cwd() + '/build/' + result[1];
                    var tm = getTimestamp(target_file);
                    
                    file = file.replace( '?t=' + result[2] , '?t=' + tm );
                }
                
                fs.writeFileSync( tplFolder + tpl , utils.encode(file) );
            });
            utils.success('Add timestamp success.');
        }catch(e){utils.log('No tpl folder. Try "ufo update php"')};
    });
};

var publish = function(cb){
    utils.log('try to publish now.');
    try{
        utils.processFolder( process.cwd() + '/../static' , process.cwd() + '/build/static'  );
    }catch(e){
        if( e.message.indexOf('ENOENT') != -1 ){
            utils.error('Not in project folder.' ,null , true);
        }
    }
    utils.success('Publish success.');
    
    
    cb && cb();

};


exports.run = function(params , options , cb){
    options = options || {};

    utils.removeFolder('build');
    utils.createFolder('build');


    
    utils.processFolder(process.cwd() + '/build' , process.cwd() , ['build','app.json']);
    
    
    //exec('r.js -o name='+ confJs.baseUrl + '/' + confJs.name + ' out=' + confJs.out);
    requirejs.optimize(confJs , function(res){
        utils.success('requirejs build js success.');

        exec('r.js -o cssIn='+ confCss.cssIn + ' out=' + confCss.out , function(){
            utils.success('requirejs build css success.');

            //fs.writeFileSync( process.cwd() + '/build' + UFO_JS , fs.readFileSync(process.cwd() + UFO_JS) );
            
            compileHtml();
            
            
            if( options.compile ){
                exec( 'java -jar '+ yuicompressor +' --type js --charset utf-8 ' + confJs.out + ' -o ' + confJs.out  , function(error){
                    if( !error ){
                        utils.success('Compress javascript file success.');
                    }else{
                        utils.error('Error! '+ error);
                    }
                    exec( 'java -jar '+ yuicompressor +' --type css --charset utf-8 ' + confCss.out + ' -o ' + confCss.out  , function(error){
                        if( !error ){
                            utils.success('Compress css file success.');
                        }else{
                            utils.error('Error! '+ error);
                        }
                        compileTimestamp();
                        options.publish && publish(cb);
                    });
                });

            }else{
                compileTimestamp();
                options.publish && publish(cb);
            }
            
        });
            

        
    });


//    requirejs.optimize(confCss , function(res){//sth. bug goes here
//    });

};

