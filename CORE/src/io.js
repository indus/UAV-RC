'use strict';
var assert = require('assert');

define(['module', 'args', 'express', 'http', 'socket.io'], function (m, args, express, http, io) {


    var Core = function () {
        this.modules = {};

        // loadFn to load a Module (io!someModule) http://requirejs.org/docs/plugins.html#apiload
        this.load = function (name, req, onload, config) {

            // set name to core if no name is provided
            name = (!name || name.match(/core/i)) ? 'core' : name;

            // get moduleConfig from requirejs.config set in index.js
            var moduleConfig = config.config[name] || {}

            if (name == 'core' && !this.core) {
                this.init(name, req, onload, config, moduleConfig);
                return;
            } else {
                console.log("load Module" + name);
            }

            if (true || configIO.core.returnLate) {
                this.modules[name] = {
                    onload: onload
                }
                //this.onloadCallbacks = this.onloadCallbacks || {};
                //this.onloadCallbacks[name] = onload;
                onload = null;
            };

            this.loadModule(name, req, onload, config, moduleConfig);



            //console.log(name, req, onload, config);
        }

        this.loadModule = function (name, req, onload, config, moduleConfig) {
            var modulePath = config.paths[name] || name;
            var moduleType = modulePath.substr((~-modulePath.lastIndexOf(".") >>> 0) + 2) || "js"

            switch (moduleType) {
                case "py":
                    this.loadModulePY(name, req, onload, config, moduleConfig)
                    break;
                case "js":
                    this.loadModuleJS(name, req, onload, config, moduleConfig)
                    break;
                default:
                    console.error("Unknown FileType", moduleType)
                    break;
            }
        }

        this.loadModulePY = function (name, req, onload, config, moduleConfig) {
        }

        this.loadModuleJS = function (name, req, onload, config, moduleConfig) {
            console.log(name);
            req([name], function (module) {
                assert(module, name + " - Module is undefined!");
                module.id = name;
                module.config = moduleConfig;
                //module.io = ioClient.connect(URL)

                /*module.id = name;
                module.config = moduleConfig;
                module.io = ioClient.connect(URL)
                /*_.defaults(module, {
                    slots: [],
                    signals: []
                })

                ioLogger(name, config_.log).extend(module)

                var ioOnConnect = function () {
                    var unveil = _.pick(module, 'id', 'slots', 'signals')
                    module.io.emit('unveil', unveil)
                    module.info('connect')
                }

                var ioOnConnecting = function () {
                    module.info('connecting')
                }

                var ioOnError = function (err) {

                    module.error('connecting', err)
                    module.io.socket.reconnect();
                }

                module.io
                    .on('connect', ioOnConnect)
                    .on('connecting', ioOnConnecting)
                    .on('error', ioOnError)

                module.init && module.init();*/

                onload && onload(module);

            })
        }

        // init the core
        this.init = function (name, req, onload, config, moduleConfig) {

            // with Express-Server
            this.app = express();
            this.server = http.createServer(this.app);
            this.server.listen(args.port, args.host);

            var core = io.listen(this.server); //  configIO.core.opt


            //var core = io.listen(80);
            core.sockets.on('connection', this.onConnection)
        }

        this.onConnection = function (socket) {
            console.log("XXX");
        };


    }



    return new Core();
});


//'use strict';

//define(['module', 'lodash', 'express', 'http', 'socket.io', 'socket.io-client', 'ioLogger', 'child_process'], function (m, _, express, http, io, ioClient, ioLogger, child_process) {

//    var configIO = m.config()
//    var HOST = configIO.host || 'localhost';
//    var PORT = configIO.port || 8080;
//    var URL = 'http://' + HOST + ':' + PORT;

//    var moduleLoader = {
//        version: "0.1",
//        slots: [],
//        signals: [],
//        modules: {},
//        load: function (name, req, onload, config) {
//            name = (!name || name.match(/core/i)) ? 'core' : name;
//            var config_ = config.config[name] || {}
//            //var logDefaults = configIO.log.defaults
//            //var log = config_.log || {}

//            if (name == 'core') {
//                if (!this.core) {
//                    //config_.log = _.defaults(log, logDefaults)
//                    this.initCore.call(this, name, req, onload, config, config_);
//                }
//                return;
//            }

//            if (configIO.core.returnLate) {
//                this.modules[name] = {
//                    onload: onload
//                }
//                //this.onloadCallbacks = this.onloadCallbacks || {};
//                //this.onloadCallbacks[name] = onload;
//                onload = null;
//            };

//            var filePath = config.paths[name] || name;
//            var fileType = filePath.substr((~-filePath.lastIndexOf(".") >>> 0) + 2)
//            fileType = fileType || "js"
//            switch (fileType) {
//                case "py":
//                    //config_.log = _.defaults(_.defaults(log, config.config.log[fileType] || {}), logDefaults)
//                    this.loadPY.call(this, name, req, onload, config, config_);
//                    break;
//                case "js":
//                    //config_.log = _.defaults(_.defaults(log, config.config.log[fileType] || {}), logDefaults)
//                    this.loadJS.call(this, name, req, onload, config, config_);
//                    break;
//                default:
//                    console.error("Unknown FileType", fileType)
//                    break;
//            }

//        },
//        initCore: function (name, req, onload, config, config_) {
//            var $ = this;
//            $.app = express();

//            $.server = http.createServer($.app);

//            $.server.listen(PORT, HOST)

//            var core = io.listen($.server, configIO.core.opt)
//            core.onload = onload;
//            ioLogger('CORE', config_.log).extend(core)
//            core.info("INIT")
//            core.sockets.on('connection', function (socket) {
//                socket.on('unveil', function (unveil) {
//                    socket.name = unveil.id;

//                    core.info('unveil', unveil.id)

//                    //console.log(config_.log.socket)
//                    /*var color = 'red'
//					var color_ = 'red' || config.config[socket.name].log.color
//					ioLogger("SOCKET_" [color] + socket.name[color_], config_.log.socket || {}).extend(socket)*/

//                    var module
//                    if (module = $.modules[unveil.id]) {
//                        $.slots = _.union($.slots, module.slots = unveil.slots)
//                        $.signals = _.union($.signals, module.signals = unveil.signals)
//                        module.onload(unveil);
//                        delete module.onload;

//                        var missingSignals = _.difference($.slots, $.signals)
//                        if (missingSignals.length)
//                            core.warn('missing signals:', missingSignals.toString())
//                        var missingSlots = _.difference($.signals, $.slots)
//                        if (missingSlots.length)
//                            core.warn('missing slots:', missingSignals.toString())

//                        if (!_.reduce($.modules, function (memo, module) {
//							return memo || !!module.onload
//                        }, false) && !missingSlots.length) {

//                            core.onload(core) //_.pick($, 'modules', 'slots', 'signals')
//                        }
//                    }

//                    _.each(unveil.slots, function (slot) {
//                        socket.join(slot)
//                    })
//                    _.each(unveil.signals, function (signal) {
//                        socket.on(signal, function (data) {
//                            core.sockets.in(signal).emit(signal, data)
//                            //socket.broadcast.to(signal).emit(signal, data)
//                        })
//                    })
//                })
//                socket.on('LOG', function (log) {
//                    socket.info(log)
//                })
//            })

//            return core;
//        },
//        loadJS: function (name, req, onload, config, config_) {
//            req([name], function (module) {
//                module.id = name;
//                module.config = config_;
//                module.io = ioClient.connect(URL)
//                _.defaults(module, {
//                    slots: [],
//                    signals: []
//                })

//                ioLogger(name, config_.log).extend(module)

//                var ioOnConnect = function () {
//                    var unveil = _.pick(module, 'id', 'slots', 'signals')
//                    module.io.emit('unveil', unveil)
//                    module.info('connect')
//                }

//                var ioOnConnecting = function () {
//                    module.info('connecting')
//                }

//                var ioOnError = function (err) {

//                    module.error('connecting', err)
//                    module.io.socket.reconnect();
//                }

//                module.io
//					.on('connect', ioOnConnect)
//					.on('connecting', ioOnConnecting)
//					.on('error', ioOnError)

//                module.init && module.init();

//                onload && onload(module);

//            })

//        },
//        loadPY: function (name, req, onload, config, config_) {
//            var spawn = child_process.spawn,
//				pythonProcess = spawn('python', [config.paths[name]]);

//            ioLogger(name, config_.log).extend(pythonProcess)
//            pythonProcess.id = name;
//            pythonProcess.config = config.config[name];

//            pythonProcess.stdout.on('data', function (data) {
//                pythonProcess.info(String(data).trim())
//                //console.log(String(data))
//                //log(pythonProcess, String(data))
//            });

//            pythonProcess.on('close', function (code) {
//                console.log('python process \'%s\' exited with code \'%d\'', name, code);
//            });

//            //io.pythonCallbacks[name] = onload;
//            onload && onload(pythonProcess)

//        }
//    }

//    return moduleLoader;

//})