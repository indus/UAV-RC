'use strict';

angular.module('uavRcApp')
  .controller('DebugCtrl', function ($scope, socket) {

      $scope.emit = function () {
          socket.emit('debug', {
              signal: $scope.signal,
              data: $scope.data
          })
      }

      $scope.dataChange = function () {
          try {
              $scope.data = JSON.parse($scope.dataString)
          } catch (e) {
              $scope.data = e.message;
          }
      }

      socket.on('debug', function (data) {
          console.log(data);
      })

  })