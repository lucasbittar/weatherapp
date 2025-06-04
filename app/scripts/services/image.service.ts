/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 * Updated: [Current Date - Will be filled by system or manually if needed] To reflect usage of fetch API.
 */
'use strict';

const CSEID = '015322544866411100232:80q4o4-wffo';
const APIKEY = 'AIzaSyBze8GRhDx5kp-zA9kM9PH3IzzSK8JG6cg';

// Define interfaces for API response and resolved image data
interface GoogleSearchImageItem {
  link: string;
  mime: string;
  image: {
    width: number;
    height: number;
    contextLink: string;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchImageItem[];
  error?: { // Structure for error response from Google API
    message: string;
  };
  // other fields from response if needed
}

interface ImageDetails {
  url: string;
  type: string;
  width: number;
  height: number;
  contextLink: string;
}

// Calls Google Custom Search Engine API and returns random image details
const searchImage = function(query: string): Promise<ImageDetails | null> {
  return new Promise((resolve, reject) => {
    const customImageSize = 'xxlarge';
    const url = `https://www.googleapis.com/customsearch/v1?key=${APIKEY}&cx=${CSEID}&q=${encodeURIComponent(query)}&searchType=image&imgSize=${customImageSize}`;

    console.log('Fetching image for: ' + query + ' via Google CSE API');

    fetch(url)
      .then(response => { // Removed async from here as it's not strictly needed for this logic branch
        if (!response.ok) {
          // Attempt to parse error response
          return response.json().then((errData: GoogleSearchResponse) => { // Type errData
            const message = errData.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(message);
          }).catch(() => {
            // If parsing error response fails or it's not JSON
            throw new Error(`HTTP error! status: ${response.status}`);
          });
        }
        return response.json() as Promise<GoogleSearchResponse>; // Assert type of successful JSON response
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          const max = data.items.length;
          const random = Math.floor(Math.random() * max);
          const imageItem: GoogleSearchImageItem = data.items[random];

          resolve({
            url: imageItem.link,
            type: imageItem.mime,
            width: imageItem.image.width,
            height: imageItem.image.height,
            contextLink: imageItem.image.contextLink
          });
        } else {
          console.log('No images found for: ' + query);
          resolve(null);
        }
      })
      .catch((err: Error) => { // Type the error object
        console.error('Error fetching image via Google CSE API:', err.message);
        reject(new Error('Failed to fetch image'));
      });
  });
};

interface ImageService {
  search: (query: string) => Promise<ImageDetails | null>;
}

const imageService: ImageService = {
  search: searchImage,
};

export default imageService;
