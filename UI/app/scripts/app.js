'use strict';

angular.module('uavRcApp', [
  'ngResource',
  'btford.socket-io',
  'ngRoute'/*,
  'leaflet-directive'*/ //TODO: delete from bower_components (and never try again)
]).
factory('socket', function (socketFactory) {
    var ioSocket = io.connect('http://localhost:8081'); //  || window.location.port ? 'http://localhost:8080' : ''



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
        .otherwise({
            redirectTo: '/'
        });


}).run(function ($rootScope, socket) {

    var onLink = function () {
        $rootScope.$apply(function () {
            $rootScope.linked = true;
        });
    }

    var self = {
        id: 'UI',
        slots: {
            debug: true,
            ack: true,
            errorack: true,
            GPS_DATA: function (data) {
                //$rootScope.GPS_DATA = data;
                console.log(data);
            },
            dummyJSSignal: true,
            dummyPYSlot: true,
            dummySELFSlot: true,
            dummySELFSignal: true,
            CAMERA_PITCH_ANGLE: true,
            IO_LOG: true
        }
    }

    socket.on('connect', function () {
        var moduleDesc = {
            slots: _.keys(self.slots)
        }
        var msg = _.IOMessage(moduleDesc)

        socket.emit('CORE_SL_SLOTS_SET', msg, onLink)
    });

    /*_.each(self.slots, function (fn, slot) {
        $rootScope.$on(slot, fn)
    })*/


})


_.mixin({
    'IOMessage': function (body, reqMsg, name) {
        var msg = {
            "header": {
                "msg": {
                    "id": Math.random().toString(36).substring(2, 11),
                    "emitter": name || "UI",
                    "timestamp": +new Date()
                }
            },
            "body": body
        }
        reqMsg && (msg.header.req = reqMsg.header.msg);

        return msg;
    }
});
