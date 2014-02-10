'use strict';

angular.module('uavRcApp')
  .controller('ModulesCtrl', function ($scope, socket) {
      socket.forward('aaa', $scope);
      $scope.signals = {
          modules:true
      }

      $scope.emit = function () {
          console.log("xxx");
          socket.emit('GPS_DATA', { test: "test" }, function (data) {
              console.log("test",data);
          });
          //socket.emit(signalbtn.signal);
      }

      /*socket.forward('CAMERA_PITCH_ANGLE', $scope);
      $scope.pitchangle = 0;
      $scope.set_pitchangle = function () {
          socket.emit('CAMERA_PITCH_ANGLE_SET', { pitchangle: $scope.pitchangle });
          console.time("CAMERA_PITCH_ANGLE")
      }

      $scope.get_pitchangle = function () {
          socket.emit('CAMERA_PITCH_ANGLE_GET');
      }

      $scope.$on('socket:connect', function (data) {
          console.log("test");
          //console.log(data);
      })

      $scope.$on('socket:CAMERA_PITCH_ANGLE', function (ev, data) {
          console.timeEnd("CAMERA_PITCH_ANGLE");
          $scope.pitchangle = data.pitchangle;
      });*/


  });