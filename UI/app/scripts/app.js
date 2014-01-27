'use strict';

angular.module('uavRcApp', [
  'ngResource',
  'btford.socket-io',
  'ngRoute'/*,
  'leaflet-directive'*/ //TODO: delete from bower_components (and never try again)
]).
factory('socket', function (socketFactory) {
    var ioSocket = io.connect(window.location.port ? 'http://localhost:8080' : '');



    var socket = socketFactory({
        ioSocket: ioSocket
    });

    return socket;
}).config(function ($routeProvider) {
    $routeProvider
      .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
      })
        .when('/playground', {
            templateUrl: 'views/playground.html',
            controller: 'PlaygroundCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });


}).run(function ($rootScope, socket) {

    var onLink = function () {
        console.log("link");
        $rootScope.$apply(function () {
            $rootScope.linked = true;
        });
    }

    var self = {
        id: 'UI',
        signals: {
            COMMAND_GOTO: true,
            _SET: true
        },
        slots: {
            GPS_DATA: function (data) {
                $rootScope.GPS_DATA = data;
                //console.log(data);
            }
        }
    }

    socket.on('connect', function () {
        var moduleDesc = {
            id: self.id,
            signals: _.keys(self.signals),
            slots: _.keys(self.slots)
        }
        socket.emit('link', moduleDesc, onLink)
    });

    /*_.each(self.slots, function (fn, slot) {
        $rootScope.$on(slot, fn)
    })*/


})
