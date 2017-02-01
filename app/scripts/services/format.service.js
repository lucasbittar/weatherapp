/**
 * Project Name: Weather App | Format Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

(function() {

  'use strict';

  var $ = require('jquery');

  var now = new Date();
  var hours = now.getHours();

  // Days Array
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  // Months
  var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  // Returns a string with the day of the week
  var getDay = function(day) {
    return days[ day || now.getDay()]
  }

  // Returns a string with the month
  var getMonth = function(month) {
    return months[ month || now.getMonth()]
  }

  // Returns format based on current time
  var getFormat = function() {

    if ( hours > 5 && hours < 12) {

      return {
        currentTime: 'morning',
        greeting: 'Good Morning!',
        backgroundColor: 'efdf7e',
        dateColor: '665800'
      }

    } else if ( hours >= 12 && hours < 17 ) {

      return {
        currentTime: 'afternoon',
        greeting: 'Good Afternoon!',
        backgroundColor: 'efdf7e',
        dateColor: '665800'
      }

    } else if ( hours >= 17 && hours < 19 ) {

      return {
        currentTime: 'evening',
        greeting: 'Good Evening!',
        backgroundColor: 'ff851b',
        dateColor: 'ffbe84'
      }

    } else {

      return {
        currentTime: 'night',
        greeting: 'Good Night!',
        backgroundColor: '001f3f',
        dateColor: '0074d9'
      }

    }

  }

  // Converts Fahrenheit to Celsius
  var fahrenheitCelsius = function(tempF) {

    var tempC = Math.floor((tempF - 32) * 5/9);

    return tempC;

  }

  module.exports = {
    getDay: getDay,
    getMonth: getMonth,
    getFormat: getFormat,
    fahrenheitCelsius: fahrenheitCelsius
  }

})();
