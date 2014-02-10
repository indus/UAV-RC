'use strict';

require('stdio')

//var config = require('../config.json');

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

args.host = args.host || 'localhost';// 'localhost'; //'192.168.1.35'||
args.port = args.port || 8081;
args.url = 'http://' + args.host + ':' + args.port;
args.module = args.module ? args.module.split(",") : null;
args.__dirname = __dirname;

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
        Pilot: '../PILOT/index',
        // TODO: combine to one 'gsap' dependancy
        gsapTweenLite: '../SIMULATOR/src/gsap.nodemod/TweenLite',
        gsap: '../SIMULATOR/src/gsap.nodemod/plugins/ThrowPropsPlugin.hacked', // greensock membership ($99/year)
        uavModel: '../SIMULATOR/src/uavModel'
    },
    config: {
        dummyJSModule:{
            foo:"bar"
        }

    }
})

var requireModules = args.module || ['io!']; //, 'io!Pilot' //, 'io!dummyPYModule' //, 'io!Simulator', 'io!dummyJSModule'


requirejs(requireModules, function () {
    console.log('RUN');
});

