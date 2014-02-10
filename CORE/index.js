'use strict';

require('stdio')

var config = require('../config.json');
var _ = require('lodash');

var args = require('stdio').getopt({
    'module': {
        key: 'm',
        args: 1,
        description: 'to run modules standalone (comma-separated list)'
    },
    'coreUrl': {
        key: 'o',
        args: 1,
        description: 'the host of the Core (default "localhost")',
        value: 'a'
    },
    'port': {
        key: 'p',
        args: 1,
        description: 'the port of the Core (default "8081")'
    }
});

args.host = args.host || config.globals.host || 'localhost';
args.port = args.port || config.globals.port || 8081;
args.url = 'http://' + args.host + ':' + args.port;
args.module = args.module ? args.module.split(",") : null;
args.__dirname = __dirname;

var requirejs = require('requirejs');
requirejs.define('args', function () { return args });


var reqjsPaths = _.reduce(config.modules, function (result, val, key) {
    result[key] = val.path;
    return result;
}, _.clone(config.dependancies));

var reqjsConfig = _.reduce(config.modules, function (result, val, key) {
    result[key] = _.omit(val,"path");
    return result;
}, {});

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require,
    paths: reqjsPaths,
    config: reqjsConfig
})

var requireModules = args.module || ['io!']; //, 'io!Pilot' //, 'io!dummyPYModule' //, 'io!Simulator', 'io!dummyJSModule'


requirejs(requireModules, function () {
    console.log('RUN');
});

