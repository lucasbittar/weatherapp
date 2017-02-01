/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

(function() {

  'use strict';

  var $ = require('jquery');

  // Calls Google Images API and returns random image
  var searchImage = function(query) {

    var deferred = $.Deferred();
    var customImageVars = '&size=wallpaper';
    console.log('Fetching image for: ' + query);

    function error(err) {
      alert(err.message);
      deferred.rejected('Error');
    }

    function imageInfo(data) {

      var max = data.value.length;
      var random = randomize(max, 0);

      deferred.resolve(data.value[random]);

    }

    function randomize(max, min) {
      return Math.floor(Math.random()*(max-min+1)+min);
    }

    $.ajax({
      url:'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + query + customImageVars,
      headers: {
        'Ocp-Apim-Subscription-Key': 'f29b7fb1a829491ab00913b629ce99e0'
      },
      success: imageInfo,
      error: error
    });

    return deferred.promise();

  }

  module.exports = {
    search: searchImage
  }

})();
