'use strict';

angular.module('uavRcApp')
  .controller('DebugCtrl', function ($scope, socket, $timeout) {
      $scope.signal = "ack"
      $scope.msgs = [];
      $scope.log = [];

      socket.on('IO_LOG', function (msg) {
          $scope.log.push(msg)

      })

      $scope.emit = function () {
          var msg = angular.copy($scope.msg);

          var emit = {
              signal: $scope.signal,
              msg: angular.copy($scope.msg),
              timeString: new Date().toLocaleString(),
              timestamp: +new Date()
          }


          $scope.msgs.push(emit)

          var ack;

          if ($scope.msg.header.ack) {
              ack = function (msg) {
                  emit.ack = msg;
                  emit.timeStringAck = new Date().toLocaleString();
              }
          }

          
          /*var m = {
              signal:$scope.signal,
              msg: _.pick(emit.msg, "header", "body")
          }*/
          //socket.emit('debug', m, ack)
          socket.emit($scope.signal, _.pick(emit.msg,"header","body"), ack)



          $scope.msg.header.msg.id= Math.random().toString(36).substring(2, 11)
      }



      socket.on('ack', function (msg) {
          console.log('test');
          msg.header.req = msg.header.msg;
          msg.header.msg = {
              "id": Math.random().toString(36).substring(2, 11),
              "emitter": "UI",
              "timestamp": +new Date()
          }
          msg.body = {
              ack: msg.header.ack
          }
          msg.header.ack = false;
          console.log(msg);
          socket.emit('ACK', msg);
      })
      /*
      socket.on('ackerror', function (msg) {
          var ackId = msg.header.ack;
          msg.header.req = msg.header.msg;
          msg.header.msg = {
              "id": Math.random().toString(36).substring(2, 11),
              "emitter": "UI",
              "timestamp": +new Date()
          }
          msg.headerack = true;
      })*/

      $scope.msg = {
          header: {
              msg:{
                  id: Math.random().toString(36).substring(2, 11),
                  emitter: "UI"
              }
          },
          body: null
      }

      var setTimestamp = function () {
          $scope.msg.header.msg.timestamp = +new Date()
          $timeout(setTimestamp, 20)
      }

      setTimestamp();

      $scope.dataChange = function () {
          try {
              $scope.msg.body = JSON.parse($scope.dataString)
          } catch (e) {
              $scope.msg.body = e.message;
          }
      }

      

      socket.on('debug', function (data) {
          console.log(data);
      })

  })