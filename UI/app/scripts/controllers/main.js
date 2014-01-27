'use strict';

angular.module('uavRcApp')
  .controller('MainCtrl', function ($scope, socket) {


      var map = L.map('map').setView([48.084730529496646, 11.279869079589842], 17);

      // add an OpenStreetMap tile layer
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', function (evt) {
          var goto = {
              latitude: evt.latlng.lat,
              longitude: evt.latlng.lng,
              height: 20
          }

          socket.emit('COMMAND_GOTO', goto);
      })


      var myIcon = L.divIcon({ iconSize: [70, 70], className: 'uav' });

      // add a marker in the given location, attach some popup content to it and open the popup
      var uav = L.marker([48.084730529496646, 11.279869079589842], { draggable: true, icon: myIcon }).addTo(map).on('dragend', function (evt) {
              var set = {
                  GPS_DATA: {
                      latitude: uav._latlng.lat,
                      longitude: uav._latlng.lng,
                      height: 0
                  }
              }
              socket.emit('_SET', set);
          })

      var falcon = document.getElementById('falcon')


      uav._icon.appendChild(falcon);
      socket.forward('GPS_DATA', $scope);
      socket.forward('connect', $scope);

      $scope.goto = {
          latitude: 0,
          longitude: 0.0001,
          height: 50
      }

      $scope.send = function () {
          console.log("test");
          socket.emit('COMMAND_GOTO', $scope.goto);
      }
      $scope.$on('socket:connect', function (data) {

          var set = { "GPS_DATA": { "latitude": 48.084730529496646, "longitude": 11.279869079589842, "height": 0 } };

          socket.emit('_SET', set);
      })

      $scope.$on('socket:GPS_DATA', function (ev, data) {
          uav.setLatLng(L.latLng(data.latitude, data.longitude))

          falcon.style['-webkit-transform'] = 'rotate(' + ((180+data.heading)%360) + 'deg)';
      });


  });
