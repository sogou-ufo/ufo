

var utils = require('./utils');


function makeOptionMap(optionInfo) {
    var optionMap = {};

    if (optionInfo) {
        optionInfo.forEach(function(info) {
            if (info.shortName) {
                optionMap['-' + info.shortName] = info;
            }
            if (info.longName) {
                optionMap['--' + info.longName] = info;
            }
        });
    }

    return optionMap;
}


function parseArgs(args, optionInfo) {
    var optionMap = makeOptionMap(optionInfo),
        params = [],
        options = {},
        errors = [],
        option,
        arg,
        value;

    while (args.length > 0) {
        arg = args.shift();
        if (arg.charAt(0) === '-') {
            option = optionMap[arg];
            if (option) {
                if (option.hasValue) {
                    if (args.length === 0) {
                        errors.push('Missing value for option: ' + arg);
                    } else {
                        options[option.longName] = args.shift();
                    }
                } else {
                    options[option.longName] = true;
                }
            } else {
                errors.push('Invalid option: ' + arg);
            }
        } else {
            params.push(arg);
        }
    }

    return { params: params, options: options, errors: errors };
}



function main(){
    var args = process.argv.slice(2);
    var commandName = args.length == 0  ? 'help' : args.shift();
    var command , argInfo;

    try{
        command = require('./commands/' + commandName);
    }catch(e){
        utils.error('Invalid command: '+ commandName);
        return;
    };
    
    if (args.length === 0) {
        argInfo = { command: 'help', params: [] };
    } else {
        argInfo = parseArgs(args, command.options);
    }

    if (argInfo.errors && argInfo.errors.length > 0) {
        argInfo.errors.forEach(function(e) {
            utils.log(e);
        });
        utils.error('Invalid command line.', "Try 'ufo help <command>'.");
        return;
    }

    command.run(argInfo.params, argInfo.options, function(err) {
        if (err) {
            utils.error(err);
        } else {
            utils.success('ufo done.');
        }
    });


}




main();
