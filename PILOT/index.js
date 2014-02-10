'use strict'



define(['module', 'args', 'lodash', 'socket.io-client', 'geolib', 'uavModel'], function (m, args, _, socketIO, geolib, uav) {
    var self = this;
    this.id = m.id;

    this.signals = {
        debug: true,
        COMMAND_GOTO: true,
        POLL_GPS_DATA:true
    };

    this.slots = {
        debug: function () {

        },
        TRACK: function (data) {
            console.log("TRACK", data);
            self.track = data;
            if (self.track.autostart) {
                self.slots.TRACK_START()
            }

        },
        TRACK_START: function () {
            console.log("TRACK_START");
            self.track_i = 0;
            self.TRACK_NEXT();
            setTimeout(self.POLL_GPS_DATA, 1000)

        },
        GPS_DATA: function (data) {
            console.log('GPS_DATA');
            if (geolib.getDistance(self.wpt_next, data) < 0.005) {
                self.TRACK_NEXT()
            }

        }
    };

    this.track;

    this.TRACK_NEXT = function () {

        console.log("next");
        self.track_i++;
        var wpt = self.track.latlngs[self.track_i];

        self.wpt_next = {
            latitude: wpt.lat,
            longitude: wpt.lng,
            height: 20
        }
        self.io.emit('COMMAND_GOTO', self.wpt_next)
    }

    this.POLL_GPS_DATA = function () {
        console.log('POLL_GPS_DATA');
        self.io.emit('POLL_GPS_DATA')

        if (true) {
            setTimeout(function () {
                self.POLL_GPS_DATA()
            }, 10)
        }
    }


    this.io = socketIO.connect(args.url, {
        'reconnection delay': 0,
        'max reconnection attempts': 10
    });

    var io = this.io;

    _.each(this.slots, function (fn, slot) {
        io.on(slot, fn)
    })


    //Fired upon a succesful connection.
    io.on('connect', function () {
        console.log("connect");

        var moduleDesc = {
            id: self.id,
            signals: _.keys(self.signals),
            slots: _.keys(self.slots)
        }

        io.emit('link', moduleDesc, self.onLink)
    });

    //Fired upon a succesful connection.
    io.on('connect_failed', function (err, xhr, reconnecting) {
        if (reconnecting) {
            var attempt = io.socket['reconnectionAttempts'] - 1;
            var attemptMax = io.socket.options['max reconnection attempts'];
            console.log("\u001b[1Fconnect_failed; reconnecting: (" + attempt + "/" + attemptMax + ")");
        } else {
            io.socket.reconnect();
        }
    });

    //Fired upon a connection error.
    io.on('connect_error', function (err) { //Object error object
        console.log("connect_error");
    });

    //Fired upon a error.
    io.on('error', function (err, a, b) { //Object error object
        console.log("error", err);
        //socket.reconnect();
    });

    //Fired upon a connection timeout
    io.on('connect_timeout', function () {
        console.log("connect_timeout");
    });

    //Fired upon a successful reconnection.
    io.on('reconnect', function () { //Number reconnection attempt number
        console.log("reconnect");
    });

    //Fired upon a reconnection attempt error
    io.on('reconnect_error', function (err) { //Object error object
        console.log("reconnect_error");
    });

    //Fired upon a failed attempt reconnection.
    io.on('reconnect_failed', function () {
        console.log("reconnect_failed");
    });

    return this;

});