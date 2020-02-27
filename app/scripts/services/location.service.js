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
        latitude: position.coords.latitude,
      };

      deferred.resolve(location);
    }

    // Native browser geolocation
    navigator.geolocation.getCurrentPosition(showPosition, error);

    return deferred.promise();
  };

  // Fetches user's location and returns city, state and abbreviation based on longitude and latitude
  var getLocationInfo = function() {
    var deferred = $.Deferred();

    $.when(getLocationCoordinates()).then(success, error);

    function success({ latitude, longitude }) {
      /*
      var longitude = -73.9769727;
      var latitude = 40.7700084;
      */

      $.ajax({
        url:
          'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search',
        data: {
          q: `${latitude},${longitude}`,
          apikey: 'uv8yUDGtAMuxYOy7NJbQbIAqqf4FD0cA',
        },
      }).done((res) => {
        var locationInfo = {
          cityName: res.LocalizedName,
          stateName: res.AdministrativeArea.LocalizedName,
          stateAbbreviation: res.AdministrativeArea.ID,
          latitude: latitude,
          longitude: longitude,
        };

        deferred.resolve(locationInfo);
      });
    }

    function error(err) {
      console.log('error', err);
    }

    return deferred.promise();
  };

  module.exports = {
    getCoordinates: getLocationCoordinates,
    getInfo: getLocationInfo,
  };
})();
