'use strict';

angular.module('uavRcApp')
  .controller('DebugCtrl', function ($scope, socket, $timeout) {
      $scope.signal = "ack"
      $scope.msgs = [];
      $scope.log = [];

      socket.on('IO_LOG', function (msg) {
          console.log("test");
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

          if ($scope.ackInput) {
              ack = function (msg) {
                  emit.ack = msg;
                  emit.timeStringAck = new Date().toLocaleString();
              }
          }

          
          var m = {
              signal:$scope.signal,
              msg:_.pick(emit.msg,"header","body")
          }
          socket.emit('debug', m, ack)



          $scope.msg.header.msg.id= Math.random().toString(36).substring(2, 11)
      }



      socket.on('ack', function (msg) {
          console.log("test2");
          var ackId = msg.ack;
          msg.header.req = msg.header.msg;
          msg.header.msg = {
              "id": Math.random().toString(36).substring(2, 11),
              "emitter": "UI",
              "timestamp": +new Date()
          }
          msg.ack = true;
          socket.emit(ackId, msg);
      })

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