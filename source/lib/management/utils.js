

require('colors');
var fs = require('fs');
var util = require('util');

var log = function(message){
    console.log(message.cyan);
};

var error = function(message , usage , die){
    if (message instanceof Error) {
        console.log(('✖ ' + message.message).red.bold);
        if (message.stack) {
            console.log(('\t' + message.stack).red.bold);
        }
    } else {
        console.log(('✖ ' + message).red.bold);
    }
    if (usage) {
        console.log('usage:\n' + usage.grey);
    }
    if (die) {
        process.exit(-1);
    }
};


var warn = function(message){
    console.log(('⚠ ' + message).yellow);
};

var success = function(message) {
    console.log(('✔ ' + message).green.bold);
};

var getApacheLocation = function(filepath){
    var appconf = require('./conf').config;
    var url = appconf.apache_url ;

    var username = '' , path = '' , file='';
    if( filepath.indexOf('/search') == 0 ){//assume on the ufo server
        username = /\/search\/(\w*)\//.exec(filepath)[1];
    }
    
    var path_reg = new RegExp(appconf.apache_path_reg);

    try{
        path = path_reg.exec(filepath)[1];
    }catch(e){
        error('Error apache path reg.');
    }

    if( path[path.length-1] != '/' ){
        var path_arr = path.split('/');
        file = path_arr.pop();
        path = path_arr.join('/') + '/';
    }
    
    return {
        path: url.replace('{username}' , username) + path,
        file: file
    };
};

var createFolder = function(pwd){
    try{
        fs.mkdirSync(pwd);
    }catch(e){
        if( e.message.indexOf('EEXIST') != -1 ){
            warn('Folder ' + pwd + ' exists. Using the exists folder');
        }else{
            error('Error! ' + e.message , null , true);
        }
    }
    
};

var removeFolder = function(path){
    try{
        var files = fs.readdirSync(path),
        currDir = path,
        i,
        currFile;
        
        /* Loop through and delete everything in the sub-tree after checking it */
        for (i = 0; i < files.length; i += 1) {
            currFile = fs.statSync(currDir + '/' + files[i]);
            
            if (currFile.isDirectory()) {
                // Recursive function back to the beginning
                removeFolder(currDir + '/' + files[i]);
            } else if (currFile.isSymbolicLink()) {
                // Unlink symlinks
                fs.unlinkSync(currDir + '/' + files[i]);
            } else {
                // Assume it's a file - perhaps a try/catch belongs here?
                fs.unlinkSync(currDir + '/' + files[i]);
            }
        }
        
        return fs.rmdirSync(path);
    }catch(e){
        if( e.message.indexOf('ENOENT') == -1 ){
            error(e.message);
        }
    }
};

var processFile = function(target , source){console.log(target)
    util.pump(
        fs.createReadStream(source),
        fs.createWriteStream(target),
        function(err) {
            if (err) {
                warn('Failed to copy file: ' + file);
            }
        }
    );
};

var processFolder = function(target_folder , assets_dir , exclude){
    var files = fs.readdirSync(assets_dir);;
    exclude = exclude || [];
    files.forEach(function(file){
        if( file.charAt(0) == '.' ) return;
        for( var i=0,l=exclude.length; i<l; i++ ){
            if( exclude[i] == file ) return;
        }
        
        var path = fs.statSync(assets_dir + '/' + file);
        
        var target = target_folder + '/' + file;
        if( path.isDirectory() ){
            createFolder(target);

            processFolder( target , assets_dir + '/' + file );
        }else{
            processFile(target , assets_dir + '/' + file);
        }
    });
};

exports.log = log;
exports.warn = warn;
exports.error = error;
exports.success = success;
exports.getApacheLocation = getApacheLocation;
exports.createFolder = createFolder;
exports.removeFolder = removeFolder;
exports.processFile = processFile;
exports.processFolder = processFolder;