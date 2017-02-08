/**
 * Project Name: Weather App | Weather Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

(function() {

  'use strict';

  var $ = require('jquery');

  // Calls weather API and returns weather data
  var getWeatherInfo = function(lat, lng) {

    console.log('Fetching weather info...');

    var deferred = $.Deferred();

    function error(err) {
      alert(err.message);
      deferred.rejected('Error');
    }

    function weatherInfo(data) {

      deferred.resolve(data);

    }

    $.ajax({
	   url: 'https://api.forecast.io/forecast/be45cb50a809642825748280ae0a93aa/' + lat + ',' + lng,
	   crossDomain: true,
	   dataType: "jsonp",
	   success: weatherInfo,
	   error: error
    });

    return deferred.promise();

  }

  module.exports = {
    getInfo: getWeatherInfo
  }

})();
