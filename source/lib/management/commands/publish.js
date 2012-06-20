var build = require('./build');
var utils = require('../utils');
var exec = require('child_process').exec;
var rl = require('readline');
var i = rl.createInterface(process.stdin, process.stdout, null);


exports.run = function(){
    build.run({} , {
        compile:true,
        publish:true
    } , function(){
        exec('cd ..;svn st;' , function(error , stdout , stderr){
            if( !stdout.length ){
                utils.log( 'Nothing to commit.Exit!' );
                process.exit(-1);
            }

            utils.log('\nThe infomation of your svn project are:\n' + stdout);
            
            i.question('Do you want to commit all the changes?(y/n):' , function(answer){
                if( answer.toLowerCase() == 'y' || answer.toLowerCase() == 'yes' ){
                    i.question( 'Enter the message:' , function(mes){
                        i.close();
                        process.stdin.destroy();

                        exec('cd ..;svn commit -m "'+ mes +'"' , function(error , stdout){
                            utils.log(stdout);
                            utils.success('Svn Commit success');
                        });
                    });
                }else{
                    i.close();
                    process.stdin.destroy();

                    utils.log('Exit.');
                    process.exit(-1);
                }
            });
        });
    });
};