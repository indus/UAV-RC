'use strict';

var _ = require('lodash'),
    requirejs = require('requirejs'),
    config = require('../config.json');

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

var requirePaths = _.reduce(config.modules, function (result, val, key) {
    result[key] = val.path;
    return result;
}, _.clone(config.dependancies));

var requireConfig = _.reduce(config.modules, function (result, val, key) {
    result[key] = _.omit(val,"path");
    return result;
}, {});

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require,
    paths: requirePaths,
    config: requireConfig
})

var requireModules = args.module || ['io!']; //, 'io!Simulator'

requirejs.define('args', function () { return args });

requirejs(requireModules, function () {
    console.log('RUN');
});

