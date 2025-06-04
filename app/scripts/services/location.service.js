/**
 * Project Name: Weather App | Location Service
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */
'use strict';

// Fetches user's location and returns longitude and latitude
const getLocationCoordinates = function() {
  console.log('Fetching location...');

  return new Promise((resolve, reject) => {
    function success(position) {
      const location = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      };
      resolve(location);
    }

    function error(err) {
      // alert(err.message); // Avoid using alert for better error handling in React
      console.error('Geolocation error:', err.message);
      reject(new Error(err.message || 'Error getting location coordinates'));
    }

    // Native browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
};

// Fetches user's location and returns city, state and abbreviation based on longitude and latitude
const getLocationInfo = function() {
  return new Promise((resolve, reject) => {
    getLocationCoordinates()
      .then(({ latitude, longitude }) => {
        // Construct the URL for AccuWeather API
        const accuWeatherApiKey = 'uv8yUDGtAMuxYOy7NJbQbIAqqf4FD0cA'; // Consider moving to a config file
        const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${accuWeatherApiKey}&q=${latitude},${longitude}`;

        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`AccuWeather API request failed with status ${response.status}`);
            }
            return response.json();
          })
          .then(res => {
            if (!res || !res.LocalizedName || !res.AdministrativeArea) {
                console.error('Unexpected response structure from AccuWeather:', res);
                throw new Error('Invalid location data received from AccuWeather');
            }
            const locationInfo = {
              cityName: res.LocalizedName,
              stateName: res.AdministrativeArea.LocalizedName,
              stateAbbreviation: res.AdministrativeArea.ID,
              latitude: latitude,
              longitude: longitude,
            };
            resolve(locationInfo);
          })
          .catch(err => {
            console.error('Error fetching location details:', err);
            reject(err); // Forward the error from fetch or custom error
          });
      })
      .catch(err => {
        // This catches errors from getLocationCoordinates
        console.error('Error getting coordinates for location info:', err);
        reject(err);
      });
  });
};

const locationService = {
  getCoordinates: getLocationCoordinates,
  getInfo: getLocationInfo,
};

export default locationService;
