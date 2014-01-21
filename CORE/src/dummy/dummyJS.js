'use strict';

define(['module', 'args', 'socket.io-client'], function (m, args, io) {


    var fn = function (radius) {
        /// <returns type="String">concaterneted String</returns>
        /// <summary>calculates something</summary>
        /// <param type="Number">radius - test</param>
    }

    function DummyJS() {
        /// <field name="socket" type="Object">the socket.io instance</field>
        /// <field name="signals" type="Array" elementType="String">no description</field>
        /// <field name="slots" type="Array" elementType="String">no description</field>

        this.signals = ['dummyJSSignal'];
        this.slots = ['dummyJSSlot'];


        this.socket = io.connect(args.url, {
            'reconnection delay': 0,
            'max reconnection attempts': 100
        }).socket;

        var socket = this.socket;

        //Fired upon a succesful connection.
        socket.on('connect', function () {
            console.log("connect");
        });

        

        //Fired upon a succesful connection.
        socket.on('connect_failed', function (err) {
            var attempt = socket.reconnectionAttempts;
            if (attempt) {
                process.stdout.write("-");
            }
            else {
                process.stdout.write("connect_failed; waiting for server ");
                socket.reconnect();
            }
                
        });

        //Fired upon a connection error.
        socket.on('connect_error', function (err) { //Object error object
            console.log("connect_error");
        });

        //Fired upon a error.
        socket.on('error', function (err,a,b) { //Object error object
            console.log("error", err);
        });

        //Fired upon a connection timeout
        socket.on('connect_timeout', function () {
            console.log("connect_timeout");
        });

        //Fired upon a successful reconnection.
        socket.on('reconnect', function () { //Number reconnection attempt number
            console.log("reconnect");
        });

        //Fired upon a reconnection attempt error
        socket.on('reconnect_error', function (err) { //Object error object
            console.log("reconnect_error");
        });

        //Fired upon a failed attempt reconnection.
        socket.on('reconnect_failed', function () {
            console.log("reconnect_failed");
        });


        /*this.init = function () {
            var io = this.io = io.connect(URL);
            var config = this.config;

            io.on('dummyJSSlot', function (data) {
                data.count++;
                data.date.arrived = new Date();
                io.emit('dummyJSSignal', data);
            });
        };*/
    }
    return new DummyJS();
});


