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

  // Variables
  var icons = new skycons({"color": "white"});

  // Starts application by fetching user's current location
  $.when(location.getLocation()).then(success, error);

  function success(location) {
    console.log('location', location);
  }

  function error(err) {
    console.log('error', err.message);
  }

})();
