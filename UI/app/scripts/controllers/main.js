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

          //gotoNext();
      })

      //var toolbar = L.Toolbar().addToolbar(map);



      // Initialise the FeatureGroup to store editable layers
      var drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Initialise the draw control and pass it the FeatureGroup of editable layers
      var drawControl = new L.Control.Draw({
          draw: {
              polyline: {
                  shapeOptions: {
                      color: '#f357a1',
                      weight: 10
                  }
              },
              polygon: {
                  allowIntersection: false, // Restricts shapes to simple polygons
                  drawError: {
                      color: '#e1e100', // Color the shape will turn when intersects
                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                  },
                  shapeOptions: {
                      color: '#bada55'
                  }
              },
              circle: false, // Turns off this drawing tool
              rectangle: false,
              marker: {
                  //icon: new MyCustomMarker()
              }
          },
          edit: {
              featureGroup: drawnItems
          }
      });
      map.addControl(drawControl);

      var flightTrack;

      map.on('draw:created', function (e) {
          var type = e.layerType,
              layer = e.layer;

          if (type === 'polyline') {

              var track = {
                  autostart: true,
                  latlngs: layer.getLatLngs()
              }

              //socket.emit('TRACK', track);
              
              flightTrack = layer.getLatLngs();
              i = 0;
              gotoNext()
          }

          
          drawnItems.addLayer(layer);
      });


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


      var i = 0;

     /* var path = [{
          lat: 48.08461585426591,
          lng: 11.277809143066404, height: 50
      }, {
          lat: 48.08596327208004,
          lng: 11.278796195983885, height: 50
      },
    {
        lat: 48.085160559334795,
        lng: 11.281521320343018, height: 50
    }];*/


      var wptNext;

      var gotoNext = function () {
          if (i == flightTrack.length)
              return;
          wptNext = flightTrack[i++];
          var goto = {
              latitude: wptNext.lat,
              longitude: wptNext.lng,
              height: 20
          }
          socket.emit('COMMAND_GOTO', goto);
      }


      


      $scope.send = function () {
          socket.emit('COMMAND_GOTO', $scope.goto);
      }
      $scope.$on('socket:connect', function (data) {

          var set = { "GPS_DATA": { "latitude": 48.084730529496646, "longitude": 11.279869079589842, "height": 0 } };

          socket.emit('_SET', set);
      })

      $scope.$on('socket:GPS_DATA', function (ev, data) {
          var posCurr = L.latLng(data.latitude, data.longitude)
          if (posCurr.distanceTo(wptNext) < 5) {
              gotoNext()
          }

          uav.setLatLng(posCurr)
          falcon.style['-webkit-transform'] = 'rotate(' + ((180 + data.heading) % 360) + 'deg)';
      });


  });
