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
    // The forecast.io API (Dark Sky) was acquired by Apple and is being phased out.
    // This API key and endpoint may no longer work or may require a CORS proxy if it only supports JSONP.
    // For this refactor, we assume it might work with a direct fetch call (CORS enabled).
    // If it's strictly JSONP, this will fail.
    const apiKey = 'be45cb50a809642825748280ae0a93aa'; // Consider moving to a config
    const url = `https://api.forecast.io/forecast/${apiKey}/${lat},${lng}`;

    // NOTE: The original code used dataType: 'jsonp'.
    // The fetch API does not support JSONP directly.
    // If the server supports CORS, a regular fetch will work.
    // If not, an alternative API or a JSONP helper would be needed.
    // Or, a server-side proxy that adds CORS headers.

    fetch(url)
      .then(response => {
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
