'use strict';

angular.module('uavRcApp')
  .controller('PlaygroundCtrl', function ($scope, socket) {
      socket.forward('GPS_DATA', $scope);
      socket.forward('connect', $scope);

      $scope.goto = {
          latitude: 0,
          longitude: 0.0001,
          height: 50
      }

      $scope.send = function () {
          console.log('COMMAND_GOTO', $scope.goto);
          socket.emit('COMMAND_GOTO', $scope.goto);
      }
      $scope.$on('socket:connect', function (data) {
          console.log("test");
          //console.log(data);
      })

      $scope.$on('socket:GPS_DATA', function (ev, data) {
          $scope.GPS_DATA = data;
      });


  });
