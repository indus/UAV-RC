'use strict';
var assert = require('assert');



define(['module', 'args', 'lodash', 'child_process'], function (m, args, _, child_process) {
    /// <var type="Object">the module (proxy for 'this')</var>
    var self = this;

    this.modules = {};

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

            var ackCache = self.ackCache = {};
            // with Express-Server
            self.express = express();
            // TODO make Web-Server module
            self.server = http.createServer(self.express);
            self.express.use('/', express.static(args.__dirname + moduleConfig.pathStaticWebFiles));
            self.server.listen(args.port, args.host);
            self.io = io.listen(self.server, { 'log level': 0 }/*{'log level':0}*/);

            // without express
            // var core = io.listen(80);

            var onConnection = function (socket) {

                (function () {
                    var emit = socket.emit;
                    socket.emit = function () {
                        console.log('test2', arguments[0]);
                        //console.log('***', 'emit', Array.prototype.slice.call(arguments));
                        emit.apply(socket, arguments);
                    };
                    var $emit = socket.$emit;
                    socket.$emit = function () {
                        var
                        signal = arguments[0],
                        msg = arguments[1],
                        ackFn = arguments[2];

                        if (!_.isIOMessageValid(msg)) {
                            console.error("ERROR [400]: Bad Request", msg)
                            ackFn && ackFn(_.IOError(400));
                            return;
                        }


                        $emit.apply(socket, arguments)


                        if (msg.header.ack) {
                            var ackID = [+new Date(), socket.name, Math.random().toString(36)].join("_");
                            var acknowledge = function (ack) {
                                var ack = ack || _.IOError(504, msg);
                                clearTimeout(clear);
                                ackFn(ack);
                                delete ackCache[ackID];
                            }
                            msg.header.ack = ackID;
                            ackCache[ackID] = acknowledge
                            var clear = setTimeout(acknowledge, moduleConfig.ackTimeout);
                            //socket.once(msg.header.ack = ackID, acknowledge);

                        }
                         
                        self.io.sockets.in(signal).emit(signal, msg);
                        self.io.sockets.in("IO_LOG").emit("IO_LOG", msg);
                    };
                })();


                socket.on('link', function (msg, callback) {
                    socket.set('id', socket.name = msg.header.msg.id);
                    var module = self.modules[msg.header.msg.id] || {};
                    _.each(msg.body.slots, function (slot) {
                        socket.join(slot)
                    })
                    if (_.isFunction(callback))
                        callback();
                    if (_.isFunction(module.onload)) {
                        module.onload();
                    }
                    return false;
                });


                socket.on('CORE_SL_SLOTS_SET', function (msg,ackFn) {
                    socket.set('id', socket.name = msg.header.msg.emitter);
                    socket.removeAllListeners();
                    var module = self.modules[socket.name] || {};
                    _.each(msg.body.slots, function (slot) {
                        socket.join(slot)
                    })
                    if (_.isFunction(callback))
                        callback();
                    if (_.isFunction(module.onload)) {
                        module.onload();
                    }
                });


                socket.on('ACK', function (msg) {
                    var ackID = msg.header.ack;
                    var ackFn = ackCache[ackID]
                    _.isFunction(ackFn) && ackFn(msg);
                    delete ackCache[ackID];
                });





                var onDisconnect = function (socket) {

                }

                socket.on('disconnect', onDisconnect)


                var getDescription = function (msg, callback) {
                    var map = {
                        slots: _.ioDescSlots(self.io),
                        signals: _.ioDescSignals(self.io),
                        modules: _.ioDescModules(self.io)
                    }
                    callback(map)
                }
                socket.on('IO_GET_DESCRIPTION', getDescription)
            };

            _.mixin(
                {
                    'ioDescModules':
                       function (io) {
                           return _.reduce(io.sockets.sockets, function (mapModules, socket, id) {
                               mapModules[id] = _.ioDescModule(socket);
                               return mapModules;
                           }, {});
                       },
                    'ioDescModule':
                       function (socket) {
                           return {
                               name: socket.name,
                               slots: _.map(_.keys(socket.manager.roomClients[socket.id]), function (roomName) { return roomName.substring(1) }),
                               signals: _.keys(socket._events),
                               connected: !socket.disconnected
                           };
                       },
                    'ioDescSignals':
                        function (io) {
                            return _.reduce(self.io.sockets.sockets, function (mapSignals, socket, id) {
                                _.each(socket._events, function (val, key) {
                                    mapSignals[key] = mapSignals[key] || [];
                                    mapSignals[key].push(socket.id)
                                })
                                return mapSignals;
                            }, {})
                        },
                    'ioDescSlots':
                        function (io) {
                            return _.reduce(self.io.sockets.manager.rooms, function (mapSlots, slotMemebers, slotName) {
                                mapSlots[slotName.substring(1)] = slotMemebers
                                return mapSlots;
                            }, {})
                        }
                }
            );




            self.io.sockets.on('connection', onConnection);
            //socket.on('message', function (message, callback) { })

            onload();
        })
    }

    _.mixin({
        'IOMessage': function (body, reqMsg, name) {
            var msg = {
                "header": {
                    "msg": {
                        "id": Math.random().toString(36).substring(2, 11),
                        "emitter": name || "UI",
                        "timestamp": +new Date()
                    }
                },
                "body": body
            }
            reqMsg && (msg.header.req = reqMsg.header.msg);

            return msg;
        },
        'IOError': function (error, reqMsg, name) {
            var errorMap = {
                '504': "Gateway Time-out",
                '400': "Bad Request"
            }

            var msg = {
                "header": {
                    "msg": {
                        "id": Math.random().toString(36).substring(2, 11),
                        "emitter": name || "UI",
                        "timestamp": +new Date()
                    },
                    'ack':false
                },
                "error": {
                    code: error,
                    description: errorMap[error]
                }
            }
            reqMsg && (msg.header.req = reqMsg.header.msg);

            return msg;
        },
        'isIOMessageValid': function (msg) {
            return !!(msg
                && msg.header
                && msg.header.msg
                && msg.header.msg.id
                && msg.header.msg.emitter
                && msg.header.msg.timestamp)
        }
    })

    return this;
});