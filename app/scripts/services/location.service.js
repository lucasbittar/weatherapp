/**
 * Project Name: Weather App | Location Service
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

(function() {

  'use strict';

  var $ = require('jquery');
  var _ = require('lodash');

  // Fetches user's location and returns longitude and latitude
  var getLocationCoordinates = function() {

    console.log('Fetching location...');

    var deferred = $.Deferred();
    var longitude;
    var latitude;

    function error(err) {
      alert(err.message);
      deferred.rejected('Error');
    }

    function showPosition(position) {

      var location = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      };

      deferred.resolve(location);

    }

    // Native browser geolocation
    navigator.geolocation.getCurrentPosition(showPosition, error);

    return deferred.promise();

  }

  // Fetches user's location and returns city, state and abbreviation based on longitude and latitude
  var getLocationInfo = function() {

    var deferred = $.Deferred();
    var cityName,
        stateName,
        stateAbbreviation;

    $.when(getLocationCoordinates()).then(success, error);

    function success(coords) {
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);

      geocoder.geocode({
        'latLng': latlng
      }, function(results, status) {
        for (var i=0; i<results[0].address_components.length; i++) {
          for (var b = 0; b < results[0].address_components[i].types.length; b++) {
            if (results[0].address_components[i].types[b] == "administrative_area_level_2") {
              var city = results[0].address_components[i];
              cityName = city.long_name;
              break;
            }

            if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
              var state = results[0].address_components[i];
              stateAbbreviation = state.short_name;
              stateName = state.long_name;
              break;
            }
          }
        }

        var locationInfo = {
          cityName: cityName,
          stateName: stateName,
          stateAbbreviation: stateAbbreviation,
          latitude: coords.latitude,
          longitude: coords.longitude
        }

        deferred.resolve(locationInfo);

      });
    }

    function error(err) {
      console.log('error', err);
    }

    return deferred.promise();

  }

  module.exports = {
    getCoordinates: getLocationCoordinates,
    getInfo: getLocationInfo
  }

})();