'use strict';

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
        description: 'the port of the Core (default "8080")'
    }
});

args.host = args.host || '127.0.0.1';
args.port = args.port || 8080;
args.url = 'http://' + args.host + ':' + args.port;
args.module = args.module ? args.module.split(",") : null;

var requirejs = require('requirejs');
requirejs.define('args', function () { return args });

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require,
    paths: {
        //coreConfig: 'src/coreConfig',
        io: 'src/io',
        dummyJSModule: 'src/dummy/dummyJS',
        dummyPYModule: 'src/dummy/dummyPY.py',
        Simulator: '../SIMULATOR/index',
    },
    config: {
    }
})

var requireModules = args.module || ['io!', 'io!Simulator'];




requirejs(requireModules, function ( /*js, py, io*/) {
    console.log('RUN');
});

