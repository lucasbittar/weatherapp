/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

(function() {

  'use strict';

  var $ = require('jquery');

  // Calls Google Images API and returns random image
  var searchImage = function(stateName, currentTime) {

    console.log('Fetching weather info...');

    var deferred = $.Deferred();
    var customImageVars = '&imgsz=xxlarge&imgc=color&imgtype=photo&rsz=8&as_filetype=jpg';
    var fullQuery = stateName + ' city ' + (currentTime || '');
    console.log('Fetching image for: ' + fullQuery);

    function error(err) {
      alert(err.message);
      deferred.rejected('Error');
    }

    function imageInfo(data) {

      // var condition = data.currently.summary;
      // var temp = data.currently.apparentTemperature;
      // var icon = data.currently.icon;
      // var dateHMTL = '<span class="date" style="color: #' + dateColor + '"> ' + days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear() + '</span>';
      // desc = condition.text;

      // $('.city').html(cityName + ', ' + stateName + ' • ' + dateHMTL);
      // $('.temp-f').html(Math.floor(temp) + '˚F');
      // $('.temp-c').html(fahrenheitCelsius(temp) + '˚C');
      // $('.desc').html('<canvas id="icon" class="icon" width="64" height="64"></canvas>' + condition);

      // icons.add('icon', icon);
      // icons.play();

      deferred.resolve(data);

    }

    $.ajax({
      url:"https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + fullQuery + customImageVars,
      crossDomain: true,
      dataType: "jsonp",
      success: imageInfo,
      error: error
    });

    return deferred.promise();

  }

  module.exports = {
    search: searchImage
  }

})();
