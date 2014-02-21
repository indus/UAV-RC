'use strict';

angular.module('uavRcApp')
  .controller('DebugCtrl', function ($scope, socket, $timeout) {
      $scope.signal = "ack"
      $scope.msgs = [];
      $scope.log = [];

      socket.on('*', function (msg) {
          $scope.log.push(msg)
      })

      $scope.emit = function () {
          var msg = angular.copy($scope.msg);

          var ack;

          if ($scope.msg.header.msg.ack) {
              ack = function (msg) {
                  console.log(msg);
                  var date = new Date();
                  emit.ack = msg;
                  emit.timeStringAck = ((+new Date()) - emit.timestamp)+" ms";
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


          $scope.msgs.push(emit);
          $scope.msg.header.msg.id= Math.random().toString(36).substring(2, 11)
      }



      socket.on('ack', function (msg) {
          console.log(msg);
          if (!_.path(msg, 'header.msg.ack'))
              return;
          msg = _.ioMsg(null, null, msg);
          socket.emit('ACK', msg);
      })

      socket.on('ackerror', function (msg) {
          if (!_.path(msg, 'header.msg.ack'))
              return;
          msg = _.ioMsg("Error", null, msg);
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