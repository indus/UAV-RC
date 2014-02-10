'use strict';
var assert = require('assert');

define(['module', 'args', 'lodash', 'child_process'], function (m, args, _, child_process) {
    /// <var type="Object">the module (proxy for 'this')</var>
    var self = this;

    this.modules = {};

    console.log(args);

    // loadFn to load a Module (io!someModule) http://requirejs.org/docs/plugins.html#apiload
    this.load = function (name, req, onload, config) {

        // set name to core if no name is provided
        name = (!name || name.match(/core/i)) ? 'CORE' : name;

        // get moduleConfig from requirejs.config set in index.js
        var moduleConfig = config.config[name] || {}

        if (name == 'CORE' && !this.core) {
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
            //console.log("test" + String(data).trim());
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
            self.express.use('/', express.static(args.__dirname + moduleConfig.pathStaticWebFiles));
            self.server.listen(args.port, args.host);
            self.io = io.listen(self.server, {}/*{'log level':0}*/);

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
                        socket.on(signal, function (msgReq, ackFn) {
                            if (ackFn) {
                                var ackID = [+new Date(), socket.name, Math.random().toString(36)].join("_");
                                
                                var acknolege = function (msg) {
                                    var msg =  msg || {
                                        "header": {
                                            "msg": {
                                                "id": Math.random().toString(36).substring(2, 11),
                                                "emitter": "CORE",
                                                "timestamp": +new Date()
                                            },
                                            "req": msgReq.header.msg
                                        },
                                        "error": {
                                            code: 504,
                                            description: "Gateway Time-out"
                                        }
                                    }

                                    clearTimeout(clear);
                                    socket.removeAllListeners(ackID);
                                    ackFn(msg)
                                }

                                
                                
                                var clear = setTimeout(acknolege, moduleConfig.ackTimeout)

                                

                                socket.once(msgReq.ack = ackID, acknolege);
                            }
                            self.io.sockets.in(signal).emit(signal, msgReq)
                        })
                    })

                    socket.on("debug", function (data, ackFn) {
                        var msgReq = data.msg;
                        if (ackFn) {
                            var ackID = [+new Date(), socket.name, Math.random().toString(36)].join("_");
                            var acknowledge = function (msg) {
                                console.log(ackID);
                                var msg = msg || {
                                    "header": {
                                        "msg": {
                                            "id": Math.random().toString(36).substring(2, 11),
                                            "emitter": "CORE",
                                            "timestamp": +new Date()
                                        },
                                        "req": msgReq.header.msg
                                    },
                                    "error": {
                                        code: 504, 
                                        description: "Gateway Time-out"
                                    }
                                }

                                clearTimeout(clear);
                                socket.removeAllListeners(ackID);
                                ackFn(msg)
                            }



                            var clear = setTimeout(acknowledge, moduleConfig.ackTimeout)



                            socket.once(msgReq.ack = ackID, acknowledge);
                        }
                        self.io.sockets.in(data.signal).emit(data.signal, msgReq);
                    });

                    if (_.isFunction(callbackFn))
                        callbackFn();

                    if (_.isFunction(module.onload)) {
                        module.onload();
                    }

                })

            };

            var modules = function (socket) {
                socket.emit("modules", "test")
            }
            self.io.sockets.on('connection', onConnection);
            self.io.sockets.on('modules', modules);
            onload();
        })
    }

    return this;
});