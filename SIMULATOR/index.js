'use strict'



define(['module', 'args', 'lodash', 'socket.io-client', 'gsap', 'geolib', 'uavModel'], function (m, args, _, socketIO, gsap, geolib, uav) {
    /// <field name="socket" type="Object">the socket.io instance</field>
    /// <field name="signals" type="Array" elementType="String">no description</field>
    /// <field name="slots" type="Array" elementType="String">no description</field>
    /// <field name="id" type="String">the moduleID defined in requirejs.config index.js</field>

    /// <var type="Object">the module (proxy for 'this')</var>
    var self = this;

    var ThrowPropsPlugin = gsap.ThrowPropsPlugin;

    var speedMax = 15; // 15m/s
    var speedNormal = 12; // 12m/s
    var overshootThreshold = 0.4 // ThrowPropsPlugin
    var resistance = 100 // ThrowPropsPlugin

    uav.GPS_DATA.latitude = uav.GPS_DATA.latitude || 0;
    uav.GPS_DATA.longitude = uav.GPS_DATA.longitude || 0;
    uav.GPS_DATA.height = uav.GPS_DATA.height || 0;
    uav.GPS_DATA.heading = uav.GPS_DATA.heading || 0;

    ThrowPropsPlugin.track(uav.GPS_DATA, 'latitude,longitude,height,heading')
 

    /*setTimeout(function () {

        self.slots._SET({
            latitude: 10
        })
        
        var goto = {
            latitude: 0,
            longitude: 0.0001,
            height: 50
        }

        self.slots.COMMAND_GOTO(goto)
    }, 200)*/



    this.id = m.id

    this.signals = {
        debug: true,
        LL_STATUS: true,
        IMU_RAWDATA: true,
        IMU_CALCDATA: true,
        GPS_DATA: true,
        GPS_DATA_ADVANCED: true,
        RC_DATA: true,
        CONTROLLER_OUTPUT: true,
        current_way: true,
        CAM_Data: true,
        POLL: true
    };

    this.slots = {
        _debug: function (data) {
            console.log('debug', (arguments.length - 1) ? arguments : data);
        },
        COMMAND_GOTO: function (goto) {

            var distance = geolib.getDistance(uav.GPS_DATA, goto); // meter
            var bearing = geolib.getBearing(uav.GPS_DATA, goto); // deg

            var duration = distance / speedNormal;
            var durationMin = distance / speedMax;
            var durationMax = duration * 1.2;

            var tween = ThrowPropsPlugin.to(uav.GPS_DATA, {
                throwProps: {
                    resistance: resistance,
                    latitude: {
                        end: goto.latitude
                    },
                    longitude: {
                        end: goto.longitude
                    },
                    height: {
                        end: goto.height
                    },
                    heading: {
                        end: bearing
                    }
                },
                onUpdate: function () {

                    console.log("\u001b[1F" + uav.GPS_DATA.latitude.toFixed(10), uav.GPS_DATA.longitude.toFixed(10), uav.GPS_DATA.height.toFixed(2), uav.GPS_DATA.heading.toFixed(2));
                },
                ease: gsap.Quad.easeOut
            }, durationMax, durationMin, overshootThreshold);
        },
        COMMAND_LAUNCH: function () {

        },
        COMMAND_LAND: function () {

        },
        COMMAND_HOME: function () {

        },
        POLL_LL_STATUS: function () {
           self.io.emit('LL_STATUS', uav.LL_STATUS)
        },
        POLL_IMU_RAWDATA: function () {
           self.io.emit('IMU_RAWDATA', uav.IMU_RAWDATA)
        },
        POLL_IMU_CALCDATA: function () {
           self.io.emit('IMU_CALCDATA', uav.IMU_CALCDATA)
        },
        POLL_GPS_DATA: function () {
           self.io.emit('GPS_DATA', uav.GPS_DATA)
        },
        POLL_GPS_DATA_ADVANCED: function () {
           self.io.emit('GPS_DATA_ADVANCED', uav.GPS_DATA_ADVANCED)
        },
        POLL_RC_DATA: function () {
           self.io.emit('RC_DATA', uav.RC_DATA)
        },
        POLL_CONTROLLER_OUTPUT: function () {
           self.io.emit('CONTROLLER_OUTPUT', uav.CONTROLLER_OUTPUT)
        },
        POLL_current_way: function () {
           self.io.emit('current_way', uav.current_way)
        },
        POLL_CAM_Data: function () {
           self.io.emit('CAM_Data', uav.CAM_Data)
        },
        _POLL: function (packageID) {
            var poll = uav;
            if (packageID) {
                if (_.isNumber(packageID)) {
                    packageID = {
                        0x0001: 'LL_STATUS',
                        0x0002: 'IMU_RAWDATA',
                        0x0004: 'IMU_CALCDATA',
                        0x0008: 'GPS_DATA',
                        0x0010: 'CONTROLLER_OUTPUT',
                        0x0080: 'GPS_DATA',
                        0x0100: 'current_way',
                        0x0200: 'GPS_DATA_ADVANCED',
                        0x0800: 'CAM_Data'
                    }[packageID]
                }
                poll = poll[packageID]
            }

           self.io.emit('POLL', poll)
        },
        _SET: function (data, packageID) {
            console.log("x",arguments)
            if (arguments.length == 1) {
                console.log("xx", self.slots._SET);
                _.forEach(data, self.slots._SET)
            } else if (packageID && data) {
                ;
                if (_.isNumber(packageID)) {
                    packageID = {
                        0x0001: 'LL_STATUS',
                        0x0002: 'IMU_RAWDATA',
                        0x0004: 'IMU_CALCDATA',
                        0x0008: 'GPS_DATA',
                        0x0010: 'CONTROLLER_OUTPUT',
                        0x0080: 'GPS_DATA',
                        0x0100: 'current_way',
                        0x0200: 'GPS_DATA_ADVANCED',
                        0x0800: 'CAM_Data'
                    }[packageID]
                }
                if (uav[packageID]) {
                    uav[packageID] = _.mapValues(uav[packageID], function (v, k) {
                        return _.isUndefined(data[k]) ? v : data[k]
                    });
                }
            }
        },


    };


    this.onLink = function () {
       self.io.emit('debug', 3)
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


