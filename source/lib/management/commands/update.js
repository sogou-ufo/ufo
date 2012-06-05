
var utils = require('../utils');
var exec = require('child_process').exec;


var updates = {
    svn : function(){
        exec('svn up' , function(error , stdout , stderr){
            utils.error(stderr);
        });
    },
    lib: function(){
        
        exec('mkdir temp;cd temp;wget https://nodeload.github.com/sogou-ufo/ufo/zipball/master;unzip master;cd sogou*;mkdir ../../static/js/lib/;mv source/lib/assets/static/js/lib/* ../../static/js/lib/;mv source/lib/assets/static/js/ufo.js ../../static/js/;cd ../../;rm -rf temp;' , function(error , stdout , stderr){
            if( !error ){
                utils.success('Update lib success');
            }else{
                utils.error(error);
            }
        });
    }
};

exports.usage = 'ufo update []';

exports.run = function(params , options){
    var target;
    if( !params.length ){
        target = 'svn';
    }else{
        target = params.shift();
    }
    
    var method = updates[target];
    if( !method ){
        utils.error('No method matching.' , exports.usage , true);
    }
    method();
};

