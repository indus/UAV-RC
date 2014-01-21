'use strict';


define(['module', 'args', 'lodash', 'socket.io-client'], function (m, args, _, socketIO) {
    /// <field name="socket" type="Object">the socket.io instance</field>
    /// <field name="signals" type="Array" elementType="String">no description</field>
    /// <field name="slots" type="Array" elementType="String">no description</field>
    /// <field name="id" type="String">the moduleID defined in requirejs.config index.js</field>

    /// <var type="Object">the module (proxy for 'this')</var>
    var self = this;

    this.id = m.id
    this.signals = ['dummyJSSignal'];
    this.slots =
        {
            dummyJSSlot: function () {
                console.log('dummyJSSlot');
            },
            dummyJSSignal: function (data) {
                console.log('dummyJSSignal', data);
                //this.emit('dummyJSSignal', ++data)
            }
        };



    this.onLink = function () {
        this.emit('dummyJSSignal', 0)
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
            signals: self.signals,
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


