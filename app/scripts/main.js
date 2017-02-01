/**
 * Project Name: Weather App | Main
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */

// Core dependencies
import css from '../styles/main.css';

(function() {

  'use strict';

  // Simple console.log
  console.log('App running!');

  // Vendor
  var $ = require('jquery');
  var skycons = require('skycons');

  // Services
  var location = require('../scripts/services/location.service');
  var weather = require('../scripts/services/weather.service');
  var image = require('../scripts/services/image.service');
  var format = require('../scripts/services/format.service');

  // Variables
  var icons = new skycons({"color": "white"});
  var locationInfo;
  var weatherInfo;
  var imageInfo;
  var now = new Date();

  // Cache DOM
  var $city = $('.city');
  var $tempF = $('.temp-f');
  var $tempC = $('.temp-c');
  var $desc = $('.desc');
  var $greeting = $('.greeting');
  var $unit = $('.unit');

  // Starts application by fetching user's current location
  $.when(
    location.getInfo()
  )
  .then(retrieveLocationInfo, error);

  function retrieveLocationInfo(data) {
    console.log('Location Info', data);
    locationInfo = data;
    $.when(
      weather.getInfo(data.latitude, data.longitude),
      image.search(data.stateName)
    ).then(success, error);
  }

  function success(weatherData, imageData) {
    console.log('Weather Info', weatherData);
    console.log('Image Info', imageData);
    weatherInfo = weatherData;
    imageInfo = imageData;
    render();
  }

  function animate() {

    // Elements to animate
    var elements = ["greeting", "city", "temp", "desc", "units"];

    $('.loader').removeClass('elements-show');
    $('.loader').addClass('elements-hidden');

    $('.elements-hidden').each(function(i) {

      var toAnimate = $('.' + elements[i]);

      setTimeout(function() {
        toAnimate.removeClass('elements-hidden');
        toAnimate.addClass('elements-show');
      }, 50 * (i + 1));

    });

    setTimeout(function() {
      $('.weather-border').css('background-color', 'rgba(0,0,0,.2)');
    }, 1000);

  }

  function bindEvents() {
    $unit.on('click', toggleUnit);
  }

  function toggleUnit() {

    var unitTarget = $(this).attr('data-unit');

    if( !$(this).hasClass('active') ) {

      $unit.removeClass('active');
      $(this).addClass('active');

      if ( unitTarget == 'c' ) {

        $tempC.css({
          'transform': 'translateY(0px)',
          'opacity': 1
        });
        $tempF.css({
          'transform': 'translateY(15px)',
          'opacity': 0
        });

      } else {

        $tempF.css({
          'transform': 'translateY(0px)',
          'opacity': 1
        });
        $tempC.css({
          'transform': 'translateY(15px)',
          'opacity': 0
        });

      }

    }

  }

  function bindData() {

    var condition = weatherInfo.currently.summary;
    var temp = weatherInfo.currently.apparentTemperature;
    var icon = weatherInfo.currently.icon;
    var dateHMTL = '<span class="date" style="color: #' + format.getFormat().dateColor + '"> ' + format.getDay() + ', ' + now.getDate() + ' ' + format.getMonth() + ' ' + now.getFullYear() + '</span>';

    $city.html(locationInfo.cityName + ', ' + locationInfo.stateName + ' • ' + dateHMTL);
    $tempF.html(Math.floor(temp) + '˚F');
    $tempC.html(format.fahrenheitCelsius(temp) + '˚C');
    $greeting.html(format.getFormat().greeting);
    $desc.html('<canvas id="icon" class="icon" width="64" height="64"></canvas>' + condition);

  }

  function render() {
    console.log('All set to render!');

    bindData();
    bindEvents();
    animate();

    // icons.add('icon', icon);
    // icons.play();

  }

  function error(err) {
    console.log('error', err.message);
  }

})();
