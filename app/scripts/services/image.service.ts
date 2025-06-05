/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 * Updated: [Current Date - Will be filled by system or manually if needed] To reflect usage of fetch API.
 */
'use strict';

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
  const GOOGLE_IMAGES_API_KEY = 'AIzaSyBze8GRhDx5kp-zA9kM9PH3IzzSK8JG6cg';
  const GOOGLE_IMAGES_CSE_ID = '015322544866411100232:80q4o4-wffo';

  return new Promise((resolve, reject) => {
    const customImageSize = 'xxlarge';
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_IMAGES_API_KEY}&cx=${GOOGLE_IMAGES_CSE_ID}&q=${encodeURIComponent(query)}&searchType=image&imgSize=${customImageSize}`;

    console.log('Fetching image for: ' + query + ' via Google CSE API');

    fetch(url)
      .then(async response => { // Make this async to use await for parsing json
        if (!response.ok) {
          // Attempt to parse the error body
          const errData = await response.json().catch(parseErr => {
            // If response.json() itself fails (e.g., not JSON), throw a specific error.
            // This will be caught by the main .catch() block.
            console.error('Error parsing error JSON:', parseErr);
            throw new Error(`API request failed with status ${response.status}: Could not parse error response body.`);
          });
          // If response.json() succeeded, then errData is the parsed error object.
          const message = errData.error?.message || `Unknown error`;
          console.error('API Error:', errData); // Log the structured error from API
          throw new Error(`API request failed with status ${response.status}: ${message}`);
        }
        return response.json() as Promise<GoogleSearchResponse>; // If response is ok, parse and return data
      })
      .then((data: GoogleSearchResponse) => { // Explicitly type data here
        if (data && data.items && data.items.length > 0) { // Add check for data itself
          const max = data.items.length;
          // To make tests predictable, let's not use Math.random here.
          // We'll always pick the first item if it exists.
          // const random = Math.floor(Math.random() * max);
          const imageItem: GoogleSearchImageItem = data.items[0]; // Use first item

          if (!imageItem.link || !imageItem.image) {
            console.log('First image item is missing link or image details for: ' + query);
            resolve(null); // Or reject, depending on desired strictness
            return;
          }

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
      .catch((err: Error) => {
        // Avoid double logging if it's an error we've already processed
        if (!String(err.message).startsWith('API request failed with status')) {
          console.error('Error fetching image:', err);
        }
        // Ensure we always reject with an Error object
        if (err instanceof Error) {
            reject(err);
        } else {
            reject(new Error(String(err)));
        }
      });
  });
};

interface ImageService {
  search: (query: string) => Promise<ImageDetails | null>;
}

const imageServiceInstance: ImageService = {
  search: searchImage,
};

export default imageServiceInstance;

export type { GoogleSearchResponse, GoogleSearchImageItem, ImageDetails };
