'use strict';
var assert = require('assert');

define(['module', 'args', 'lodash', 'child_process'], function (m, args, _, child_process) {
    /// <var type="Object">the module (proxy for 'this')</var>
    var self = this;

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
            console.log("load Module '" + name + "'");
        }

        if (true || configIO.core.returnLate) {
            this.modules[name] = {
                onload: onload
            }
            onload = null;
        };

        var modulePath = config.paths[name] || name;

        var moduleType = modulePath.replace(/^(?:\.\.\/)+/, "").split(".")[1] || "js"

        switch (moduleType) {
            case "py":
                this.loadModulePY(name, req, onload, config, moduleConfig)
                break;
            case "js":
                this.loadModuleJS(name, req, onload, config, moduleConfig)
                break;
            default:
                assert(false, "Unknown FileType: " + moduleType)
                break;
        }
    }

    this.loadModulePY = function (name, req, onload, config, moduleConfig) {
        var spawn = child_process.spawn,
				pythonProcess = spawn('python', [config.paths[name]]);

        pythonProcess.id = name;
        pythonProcess.config = config.config[name];

        pythonProcess.stdout.on('data', function (data) {
            console.log("test" + String(data).trim());
            //pythonProcess.info(String(data).trim())
            //console.log(String(data))
            //log(pythonProcess, String(data))
        });

        pythonProcess.on('close', function (code) {
            console.log('python process \'%s\' exited with code \'%d\'', name, code);
        });

        //io.pythonCallbacks[name] = onload;
        onload && onload(pythonProcess)

    }

    this.loadModuleJS = function (name, req, onload, config, moduleConfig) {
        console.log("JS");
        req([name], function (module) {
            assert(module, name + " - Module is undefined!");
            onload && onload(module);
        })
    }

    // init the core
    this.init = function (name, req, onload, config, moduleConfig) {
        require(['express', 'http', 'socket.io'], function (express, http, io) {

    

            // with Express-Server
            self.express = express();
            // TODO make Web-Server module
            self.server = http.createServer(self.express);
            self.express.use('/', express.static('C:\\Users\\Stefan\\Documents\\dev\\UAV-RC\\UI\\app'));
            console.log(args.port, args.host, args.__dirname);
            self.server.listen(args.port, args.host);
            self.io = io.listen(self.server, {}/*{'log level':0}*/); //  configIO.core.opt

            // without express
            // var core = io.listen(80);

            var onConnection = function (socket) {


                socket.on('link', function (moduleDesc, callbackFn) {
                    var module = self.modules[moduleDesc.id] = self.modules[moduleDesc.id] || {};
                    module.id = moduleDesc.id;
                    module.slots = moduleDesc.slots;
                    module.signals = moduleDesc.signals;
                    //assert(!module.socket, module.id + " - looks like module allready linked")
                    module.socket = socket;

                    socket.name = module.id;

                    _.each(module.slots, function (slot) {
                        socket.join(slot)
                    })

                    _.each(module.signals, function (signal) {
                        socket.on(signal, function (data, callback) {
                            console.log(arguments[1]);
                            /*if (callback) {
                                callback("im the server");
                            }*/
                            var obj = {data:data,callback:callback}
                            //assert(arguments.length == 1, module.id + " - too much parameters in signal '" + signal + "'");
                            self.io.sockets.in(signal).emit(signal, arguments)
                        })
                    })
                    var test = function () { console.log("CALLBACK"); }

                    socket.on("debug", function (data) {
                        self.io.sockets.in(data.signal).emit(data.signal, data.data);
                    })



                    if (_.isFunction(callbackFn))
                        callbackFn();

                    if (_.isFunction(module.onload)) {
                        module.onload();
                    }

                })

            };

            var modules = function (socket) {
                console.log("XXX");
                socket.emit("modules","test")
            }
            self.io.sockets.on('connection', onConnection);
            self.io.sockets.on('modules', modules);
            onload();
        })
    }

    return this;
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