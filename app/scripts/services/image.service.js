/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */
'use strict';

import GoogleImages from 'google-images';
// const GoogleImages = require('google-images'); // If 'google-images' doesn't support ES6 import

const CSEID = '015322544866411100232:80q4o4-wffo';
const APIKEY = 'AIzaSyBze8GRhDx5kp-zA9kM9PH3IzzSK8JG6cg';

const googleImages = new GoogleImages(CSEID, APIKEY);

// Calls Google Images API and returns random image
const searchImage = function(query) {
  return new Promise((resolve, reject) => {
    const customImageVars = {
      size: 'xxlarge',
    };

    console.log('Fetching image for: ' + query);

    googleImages.search(query, customImageVars)
      .then(images => {
        if (images && images.length > 0) {
          const max = images.length;
          const random = Math.floor(Math.random() * max); // Simplified randomize
          resolve(images[random]);
        } else {
          console.log('No images found for: ' + query);
          // Resolve with a placeholder or specific structure if needed, or reject
          // For now, let's resolve with null or an empty object to avoid breaking App.js logic
          resolve(null);
        }
      })
      .catch(err => {
        console.error('Error fetching image:', err);
        // Reject with a meaningful error, perhaps the error object itself or a message
        reject(new Error('Failed to fetch image'));
      });
  });
};

const imageService = {
  search: searchImage,
};

export default imageService;
