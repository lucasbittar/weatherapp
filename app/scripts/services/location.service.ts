/**
 * Project Name: Weather App | Location Service
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */
'use strict';

// Interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
}
interface LocationResponse {
  components: LocationData;
}

interface LocationAPIResponse {
  results: LocationResponse[];
}

interface LocationDetails {
  cityName: string;
  stateName: string;
  stateAbbreviation: string;
  countryName?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
}

// Fetches user's location and returns longitude and latitude
const getLocationCoordinates = function(): Promise<Coordinates> {
  console.log('Fetching location...');

  return new Promise((resolve, reject) => {
    function success(position: GeolocationPosition) {
      const location: Coordinates = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      };
      resolve(location);
    }

    function error(err: GeolocationPositionError) {
      console.error('Geolocation error:', err.message);
      reject(new Error(err.message || 'Error getting location coordinates'));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
};

/**
 * Fetches location information (city, state, country) based on current coordinates.
 * @returns {Promise<LocationDetails>} A promise that resolves with structured location details.
 */
const getLocationInfo = async (): Promise<LocationDetails> => {
  try {
    // 1. Get Coordinates
    const { latitude, longitude }: Coordinates = await getLocationCoordinates();

    const OPEN_CAGE_API_KEY = import.meta.env.VITE_OPEN_CAGE_API_KEY;

    // 2. Build GeoLocation API URL
    const url: string = `https://api.opencagedata.com/geocode/v1/json?key=${OPEN_CAGE_API_KEY}&q=${latitude},${longitude}&pretty=1&no_annotations=1`;

    // 3. Fetch Location Data from GeoLocation
    const response: Response = await fetch(url);

    // 4. Handle HTTP Errors
    if (!response.ok) {
      let errorMessage: string = `GeoLocation API request failed with status ${response.status}`;
      try {
        const errorData: { Message?: string } = await response.json();
        if (errorData?.Message) { // Optional chaining for 'Message'
          errorMessage = errorData.Message;
        }
      } catch (jsonError) {
        console.warn('Could not parse GeoLocation error response JSON:', jsonError);
      }
      throw new Error(errorMessage);
    }

    // 5. Parse JSON Response
    const data: LocationAPIResponse = await response.json();

    // 6. Validate Response Data Structure
    // Ensure the data conforms to the expected structure
    if (!data || !data.results) {
      console.error('Unexpected response structure from GeoLocation:', data);
      throw new Error('Invalid location data received from GeoLocation. Missing expected fields.');
    }

    const locationData: LocationData = data.results[0].components;

    // 7. Structure and Return Location Information
    const locationInfo: LocationDetails = {
      cityName: locationData.city,
      stateName: locationData.state,
      stateAbbreviation: locationData.state_code,
      countryName: locationData.country,
      countryCode: locationData.country_code,
      latitude: latitude,
      longitude: longitude,
    };

    return locationInfo;

  } catch (err: any) { // Type 'any' for err in catch is a common pattern for now in TS < 4.4
    // Centralized Error Handling
    console.error('An error occurred during location info retrieval:', err.message);
    // Re-throw a standardized error message to the caller
    throw new Error(err.message || 'Failed to retrieve location information.');
  }
};

interface LocationService {
  getCoordinates: () => Promise<Coordinates>;
  getInfo: () => Promise<LocationDetails>;
}

const locationService: LocationService = {
  getCoordinates: getLocationCoordinates,
  getInfo: getLocationInfo,
};

export default locationService;
