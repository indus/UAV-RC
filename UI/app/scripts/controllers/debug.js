'use strict';

angular.module('uavRcApp')
  .controller('DebugCtrl', function ($scope, socket, $timeout) {
      $scope.signal = "ack"
      $scope.msgs = [];
      $scope.log = [];

      $scope.predefinedSignals = [
          {
              signal: "PILOT_TARGETLIST_SET", body: {
                  id: "path1", //optional
                  defaults: {
                      status:0,
                      alt: 50, // altitude in m
                      heading: 12, // heading in deg
                      autoStart: true, // fly to this tgt(number = delay in ms)
                      reachedThreshold: 2.5, // position accuracy to consider a waypoint reached in m
                      cam: {
                          pitch: -10, // camera-pitch in deg
                          roll: 0, // camera-roll in deg
                          trigger: true // trigger the camera
                      }
                  },
                  list: [{
                      lat: 56.897123,
                      lon: 11.123812,
                      alt: 52,
                      heading: 13,
                      cam: {
                          pitch: -20,
                          roll: 0,
                          trigger: true
                      }
                  }, {
                      lat: 56.897223,
                      lon: 11.123312
                  }, {
                      lat: 56.897223,
                      lon: 11.123312,
                      cam: {
                          trigger: false
                      }
                  }]
              }, ack: false
          },
{
    signal: "UAV_STATUS_GET", body: {}, ack: true
},
{
    signal: "UAV_GPSDATA_GET", body: {}, ack: true
},
{
    signal: "UAV_STATUS_GET", body: {}, ack: true
},
{
    signal: "UAV_CAM_ANGLE_GET", body: {}, ack: true
},
{ signal: "UAV_ASCTEC_LL_STATUS_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_IMU_RAWDATA_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_IMU_CALCDATA_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_RC_DATA_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_CTRL_PUT_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_GPS_DATA_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_CURRENT_WAY_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_GPS_DATA_ADVANCED_GET", body: {}, ack: true },
{ signal: "UAV_ASCTEC_CAM_DATA_GET", body: {}, ack: true },
{ signal: "UAV_CAM_TRIGGER", body: {}, ack: true },
{
    signal: "UAV_CAM_ANGLE_SET", body: {
        pitch: 0,
        roll: 0
    }, ack: true
},
{
    signal: "UAV_GOTO", body: {
        lat: 56.897123,
        lon: 11.123812,
        alt: 52, //optional
        heading: 13 //optional
    }, ack: true
},
{
    signal: "UAV_GOTOANDCAM", body: {
        lat: 56.897123,
        lon: 11.123812,
        alt: 52, //optional
        heading: 13, //optional
        cam: {
            pitch: -10, // camera-pitch in deg
            roll: 0, // camera-roll in deg
            trigger: true // trigger the camera
        }
    }, ack: true
},
{ signal: "UAV_START", body: {}, ack: true },
{ signal: "UAV_STOP", body: {}, ack: true },
{ signal: "UAV_HOME", body: {}, ack: true },
      ];

      socket.on('*', function (msg) {
          $scope.log.push(msg)
      })



      $scope.setPredefined = function (pre) {
          $scope.signal = pre.signal;
          $scope.dataString = JSON.stringify($scope.msg.body = pre.body, null, "\t")
          $scope.msg.header.msg.ack = pre.ack;
      }

      $scope.emit = function () {
          var msg = angular.copy($scope.msg);

          var ack;

          if ($scope.msg.header.msg.ack) {
              ack = function (msg) {
                  console.log(msg);
                  var date = new Date();
                  emit.ack = msg;
                  emit.timeStringAck = ((+new Date()) - emit.timestamp) + " ms";
              }
          }
          socket.emit($scope.signal, msg, ack);
          var date = new Date();


          var emit = {
              signal: $scope.signal,
              msg: msg,
              timeString: new Date().toString("HH:mm:ss tt"),
              timestamp: +new Date()
          }


          console.log(msg);
          $scope.msgs.push(emit);
          $scope.msg.header.msg.id = Math.random().toString(36).substring(2, 11)
      }



      socket.on('ack', function (msg) {
          if (!_.path(msg, 'header.msg.ack'))
              return;
          msg = _.ioMsg(null, null, msg);
          socket.emit('ACK', msg);
      })

      socket.on('ackerror', function (msg) {
          if (!_.path(msg, 'header.msg.ack'))
              return;
          msg = _.ioMsg(403, null, msg);
          socket.emit('ACK', msg);
      })

      socket.on('ackerror', function (msg) {
      })

      $scope.msg = _.ioMsg(null, null);
      $scope.validBody = true;

      var setTimestamp = function () {
          $scope.msg.header.msg.timestamp = +new Date()
          $timeout(setTimestamp, 20)
      }

      setTimestamp();

      $scope.dataChange = function () {
          try {
              $scope.msg.body = JSON.parse($scope.dataString);
              $scope.validBody = true;
          } catch (e) {
              $scope.msg.body = e.message;
              $scope.validBody = false;
          }
      }

  })