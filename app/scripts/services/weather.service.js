/**
 * Project Name: Weather App | Weather Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */
'use strict';

// Calls weather API and returns weather data
const getWeatherInfo = function(lat, lng) {
  console.log('Fetching weather info for:', lat, lng);

  return new Promise((resolve, reject) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`;

    fetch(url)
      .then(async response => {
        if (!response.ok) {
          // Attempt to get more info from response if possible
          return response.text().then(text => {
            throw new Error(`Weather API request failed with status ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        // alert(err.message); // Avoid alert
        console.error('Weather API error:', err);
        reject(new Error(err.message || 'Failed to fetch weather data'));
      });
  });
};

const weatherService = {
  getInfo: getWeatherInfo,
};

export default weatherService;
