'use strict';

angular.module('uavRcApp', [
  'ngResource',
  'btford.socket-io',
  'ngRoute'/*,
  'leaflet-directive'*/ //TODO: delete from bower_components (and never try again)
]).
factory('socket', function (socketFactory) {
    console.log();
    var ioSocket = io.connect('http://localhost:8081', { query: [["type", "UI"]].join("&").replace(/,/g, '=') }); //  || window.location.port ? 'http://localhost:8080' : ''

    

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
        .when('/ioTest', {
            templateUrl: 'views/ioTest.html',
            controller: 'IoTestCtrl'
        })
        .when('/modules', {
            templateUrl: 'views/modules.html',
            controller: 'ModulesCtrl'
        })
        .when('/debug', {
            templateUrl: 'views/debug.html',
            controller: 'DebugCtrl'
        })
        .when('/debugUAV', {
            templateUrl: 'views/debugUAV.html',
            controller: 'DebuguavCtrl'
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
        slots: {
            "*":true,
            ack: true,
            ackerror: true
        }
    }

    socket.on('connect_failed', function (err) {
        console.log("failed",err);
    });

    socket.on('error', function (err) {
        console.log("error", err);
    })

    socket.on('connect', function () {
        var moduleDesc = {
            slots: _.keys(self.slots)
        }
        var msg = _.ioMsg(null, moduleDesc)
        msg.header.msg.ack = true;
        socket.emit('CORE_SL_SLOTS_SET', msg, onLink)
    });

    /*_.each(self.slots, function (fn, slot) {
        $rootScope.$on(slot, fn)
    })*/


})

