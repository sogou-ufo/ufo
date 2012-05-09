

require('colors');


exports.log = function(message){
    console.log(message.cyan);
};

exports.error = function(message , usage , die){
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


exports.warn = function(message){
    console.log(('⚠ ' + message).yellow);
};

exports.success = function(message) {
    console.log(('✔ ' + message).green.bold);
}


