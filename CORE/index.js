'use strict';

this.id = 'CORE';
var config = require('../config.json'),
_ = require('./lodash.uav.utility.js')(require('lodash'), this.id),
http = require('http'),
express = require('express'),
socketio = require('socket.io');

this.config = config.modules[this.id];

var args = {};
args.host = args.host || config.globals.host || 'localhost';
args.port = args.port || config.globals.port || 8081;
args.url = 'http://' + args.host + ':' + args.port;
args.__dirname = __dirname;

var app = this.app = express();
var server = this.server = http.createServer(app);
var io = this.io = socketio.listen(server, { 'log level': 0 });

app.use('/', express.static(args.__dirname + this.config.pathStaticWebFiles));
server.listen(args.port, args.host);




var ackCache = io.ackCache = {};

var getAckWrapper = function (ackId, ackFn) {
    var ackWrapper = function (ack) {
        clearTimeout(ackWrapper.clear);
        ackFn(ack);
        delete ackCache[ackId];
    }
    ackCache[ackId] = ackWrapper;
    ackWrapper.clear = setTimeout(ackWrapper, this.config.ackTimeout, _.ioMsg(504))

    return ackWrapper;
}.bind(this)


//// SOCKET-FNs (this = socket)
io.emit_ = function (signal, msg) {
    io.sockets.in(signal).emit(signal, msg);
    io.sockets.in("*").emit("*", { signal: signal, msg: msg });
}

var EMIT = function (io, $emit, signal, msg, ackFn) {
    if (!_.ioValid(signal, msg)) {
        console.error("ERROR [400]: Bad Request", signal, msg)
        _.path(msg, 'header.msg.ack') && ackFn(_.ioMsg(400,null,msg))
        return;
    }


    if (_.path(msg, 'header.msg.ack')) {
        var ackId = _.ioAckId(_.ioEmitter(msg));
        ackFn = getAckWrapper(ackId, ackFn);
        msg.header.msg.ack = ackId;
    } else {
        ackFn = _.noFn();
    }

    io.emit_(signal, msg);

    $emit.call(this, signal, msg, ackFn)

};

var CORE_SL_SLOTS_SET = function (msg, ackFn) {
    console.log('CORE_SL_SLOTS_SET msg-body:', msg.body);

    _.each(msg.body.slots, function (slot) {
        this.join(slot)
    }, this)

    ackFn();

    /*
    
    if (msg.header.msg.ack)
        ackFn();
    this.set('id', this.name = msg.header.msg.emitter);
     */
};

var overrideEmit = function (socket) {
    console.log('overrideEmit');
}

io.configure(function () {
    io.set('authorization', function (handshakeData, callback) {
        console.log("handshakeData.query: " + handshakeData.query);
        if (!handshakeData.query.type)
            console.error("missing 'type' in handshake params")

        /*
        if (!handshakeData.query.type)
            callback("missing 'type' in handshake params");
        else if (!config.modules[handshakeData.query.type])
            callback("unknown module type in handshake params:" + handshakeData.query.type);
        else if (false)
            callback("there is another instance of this type");

        handshakeData.type = handshakeData.query.type;
        */


        callback(false,true);
    });
});

io.ack = function (msg) {
    var ackID = _.path(msg,'header.req.ack');
    var ackFn = ackCache[ackID]
    if (_.isFunction(ackFn))
        ackFn(msg);
    else
        console.log("no ackFn found for id:", ackID)
    delete ackCache[ackID];
}

var onConnection = function (socket) {
    console.log('connection');
    socket.$emit = EMIT.bind(socket, io, socket.$emit);

    socket.on('CORE_SL_SLOTS_SET', CORE_SL_SLOTS_SET);

    socket.on('ACK', io.ack);

}

io.sockets.on('connection', onConnection);

var pilot = require('../PILOT/index').init(io);