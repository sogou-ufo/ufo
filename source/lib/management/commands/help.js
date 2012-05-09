
var utils = require('../utils');

exports.usage = 'ufo help [command]';

exports.options = [
    {
        'shortName' : 's',
        'longName' : 'string',
        'hasValue' : true
    }
];

exports.run = function(params , options){
    console.log(params , options);
};

