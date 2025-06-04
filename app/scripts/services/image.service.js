/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 * Updated: [Current Date - Will be filled by system or manually if needed] To reflect usage of fetch API.
 */
'use strict';

const CSEID = '015322544866411100232:80q4o4-wffo';
const APIKEY = 'AIzaSyBze8GRhDx5kp-zA9kM9PH3IzzSK8JG6cg';

// Calls Google Custom Search Engine API and returns random image details
const searchImage = function(query) {
  return new Promise((resolve, reject) => {
    const customImageSize = 'xxlarge'; // API might prefer 'XXLARGE', check docs if issues
    const url = `https://www.googleapis.com/customsearch/v1?key=${APIKEY}&cx=${CSEID}&q=${encodeURIComponent(query)}&searchType=image&imgSize=${customImageSize}`;

    console.log('Fetching image for: ' + query + ' via Google CSE API');

    fetch(url)
      .then(response => {
        if (!response.ok) {
          // Try to get more error info from response body if possible
          return response.json().then(errData => {
            throw new Error(`HTTP error! status: ${response.status}, message: ${errData.error && errData.error.message ? errData.error.message : 'Unknown error'}`);
          }).catch(() => {
            // If parsing error response fails, throw generic error
            throw new Error(`HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          const max = data.items.length;
          const random = Math.floor(Math.random() * max);
          const imageItem = data.items[random];

          // Constructing an object that App.js can use, specifically needing imageInfo.url
          // Also providing other potentially useful image metadata.
          resolve({
            url: imageItem.link,
            type: imageItem.mime,
            width: imageItem.image.width,
            height: imageItem.image.height,
            contextLink: imageItem.image.contextLink // Page hosting the image
          });
        } else {
          console.log('No images found for: ' + query);
          resolve(null); // Consistent with previous behavior
        }
      })
      .catch(err => {
        // Log the full error for debugging, but reject with a user-friendly message
        console.error('Error fetching image via Google CSE API:', err);
        reject(new Error('Failed to fetch image')); // Consistent with previous behavior
      });
  });
};

const imageService = {
  search: searchImage,
};

export default imageService;
