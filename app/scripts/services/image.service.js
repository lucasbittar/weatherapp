/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

(function() {
  'use strict';

  var $ = require('jquery');
  var GoogleImages = require('google-images');

  var CSEID = '015322544866411100232:80q4o4-wffo';
  var APIKEY = 'AIzaSyBze8GRhDx5kp-zA9kM9PH3IzzSK8JG6cg';

  var googleImages = new GoogleImages(CSEID, APIKEY);

  // Calls Google Images API and returns random image
  var searchImage = function(query) {
    var deferred = $.Deferred();
    var customImageVars = {
      size: 'xxlarge',
    };

    console.log('Fetching image for: ' + query);

    function error(err) {
      // console.log('No images');
      // deferred.resolve('no-image.png');
      deferred.rejected('Error');
    }

    function imageInfo(images) {
      // console.log('Images', images);
      var max = images.length;
      var random = randomize(max, 0);

      deferred.resolve(images[random]);
    }

    function randomize(max, min) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    googleImages.search(query, customImageVars).then(imageInfo);

    return deferred.promise();
  };

  module.exports = {
    search: searchImage,
  };
})();
