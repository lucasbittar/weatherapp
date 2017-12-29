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
    var customImageVars = '&image_type=photo';
    console.log('Fetching image for: ' + query);

    function error(err) {
      // console.log('No images');
      // deferred.resolve('no-image.png');
      deferred.rejected('Error');
    }

    function imageInfo(data) {
      console.log('data', data);
      var max = data.hits.length;
      var random = randomize(max, 0);

      deferred.resolve(data.hits[random]);
    }

    function randomize(max, min) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    $.ajax({
      url:
        'https://pixabay.com/api/?key=7541656-f946c6c55f57647be27ec3e5a&q=' +
        query +
        customImageVars,
      success: imageInfo,
      error: error,
    });

    return deferred.promise();
  };

  module.exports = {
    search: searchImage,
  };
})();
