/**
 * Project Name: Weather App | Image Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 * Updated: 2026-01-17 - Migrated from Google CSE to Pexels API
 */
'use strict';

// Pexels API response interfaces
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

// ImageDetails interface for the application
export interface ImageDetails {
  url: string;
  photographer: string;
  photographerUrl: string;
  width: number;
  height: number;
}

// Calls Pexels API and returns random image details
const searchImage = function (query: string): Promise<ImageDetails | null> {
  const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

  return new Promise((resolve, reject) => {
    if (!PEXELS_API_KEY) {
      console.error('PEXELS_API_KEY environment variable is not defined.');
      reject(new Error('PEXELS_API_KEY environment variable is not defined.'));
      return;
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=15`;

    console.log('Fetching image for: ' + query + ' via Pexels API');

    fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json().catch((parseErr) => {
            console.error('Error parsing error JSON:', parseErr);
            throw new Error(
              `API request failed with status ${response.status}: Could not parse error response body.`
            );
          });
          const message = errData.error || `Unknown error`;
          console.error('API Error:', errData);
          throw new Error(
            `API request failed with status ${response.status}: ${message}`
          );
        }
        return response.json() as Promise<PexelsSearchResponse>;
      })
      .then((data: PexelsSearchResponse) => {
        if (data && data.photos && data.photos.length > 0) {
          // Pick a random photo from the results for variety
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          const photo = data.photos[randomIndex];

          resolve({
            url: photo.src.large2x || photo.src.large || photo.src.original,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            width: photo.width,
            height: photo.height,
          });
        } else {
          console.log('No images found for: ' + query);
          resolve(null);
        }
      })
      .catch((err: Error) => {
        if (!String(err.message).startsWith('API request failed with status')) {
          console.error('Error fetching image:', err);
        }
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

export type { PexelsSearchResponse, PexelsPhoto };
