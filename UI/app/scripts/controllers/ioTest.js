'use strict';

angular.module('uavRcApp')
	.controller('IoTestCtrl', function ($scope, $rootScope, socket) {

	    var longString = (new Array(100000)).join("x");

	    $scope.sendDummyJS = function () {
	        socket.emit('dummyJSSlot', {
	            message: 'dummyJSData',
	            count: $scope.dummyJSCount || 0,
	            date: {
	                send: new Date()
	            }
	        });

	    };

	    $scope.sendDummyPY = function () {
	        socket.emit('dummyPYSlot', {
	            message: 'dummyPYData',
	            count: $scope.dummyPYCount || 0,
	            date: {
	                send: new Date()
	            }
	        });

	    };

	    $scope.sendSelf = function () {
	        socket.emit('dummySELFSlot', {
	            message: longString || 'dummySELFData',
	            count: $scope.dummySELFCount || 0,
	            date: {
	                send: new Date()
	            }
	        });

	    };

	    socket.on('dummyJSSignal', function (data) {
	        console.log(data);
	        data.date.received = new Date()
	        $scope.dummyJSSignal = data;
	        $scope.dummyJSSignalTime = (data.date.received.getTime() - new Date(data.date.send).getTime()) + 'ms';
	        $scope.dummyJSCount = data.count;
	        $scope.repeat && $scope.sendDummyJS();
	    });

	    socket.on('dummyPYSignal', function (data) {
	        data.date.received = new Date()
	        $scope.dummyPYSignal = data;
	        $scope.dummyPYSignalTime = (data.date.received.getTime() - new Date(data.date.send).getTime()) + 'ms';
	        $scope.dummyPYCount = data.count;
	        $scope.repeat && $scope.sendDummyPY();
	    });

	    socket.on('dummySELFSignal', function (data) {
	        data.date.received = new Date()
	        $scope.dummySELFSignalTime = (data.date.received.getTime() - new Date(data.date.send).getTime()) + 'ms';
	        $scope.dummySELFSignal = data;
	        $scope.dummySELFCount = data.count;
	        $scope.repeat && $scope.sendSelf();
	    });

	    socket.on('dummySELFSlot', function (data) {
	        data.count++;
	        data.date.arrived = new Date();
	        this.emit('dummySELFSignal', data);
	    });

	});