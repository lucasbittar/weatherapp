/**
 * Project Name: Weather App | Location Service
 * Author: Lucas Bittar Magnani
 * Created: 20170131
 */
'use strict';

const ACCUWEATHER_API_KEY: string = 'uv8yUDGtAMuxYOy7NJbQbIAqqf4FD0cA'; // Use a constant for the API key

// Interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AccuWeatherGeoPositionResponse {
  LocalizedName: string;
  AdministrativeArea: {
    LocalizedName: string;
    ID: string;
  };
  Country: {
    LocalizedName: string;
    ID: string; // Country code
  };
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

    // 2. Build AccuWeather API URL
    const url: string = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${ACCUWEATHER_API_KEY}&q=${latitude},${longitude}&details=true`;

    // 3. Fetch Location Data from AccuWeather
    const response: Response = await fetch(url);

    // 4. Handle HTTP Errors
    if (!response.ok) {
      let errorMessage: string = `AccuWeather API request failed with status ${response.status}`;
      try {
        const errorData: { Message?: string } = await response.json();
        if (errorData?.Message) { // Optional chaining for 'Message'
          errorMessage = errorData.Message;
        }
      } catch (jsonError) {
        console.warn('Could not parse AccuWeather error response JSON:', jsonError);
      }
      throw new Error(errorMessage);
    }

    // 5. Parse JSON Response
    const data: AccuWeatherGeoPositionResponse = await response.json();

    // 6. Validate Response Data Structure
    // Ensure the data conforms to the expected structure
    if (!data || !data.LocalizedName || !data.AdministrativeArea || !data.Country) {
      console.error('Unexpected response structure from AccuWeather:', data);
      throw new Error('Invalid location data received from AccuWeather. Missing expected fields.');
    }

    // 7. Structure and Return Location Information
    const locationInfo: LocationDetails = {
      cityName: data.LocalizedName,
      stateName: data.AdministrativeArea.LocalizedName,
      stateAbbreviation: data.AdministrativeArea.ID,
      countryName: data.Country.LocalizedName,
      countryCode: data.Country.ID,
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
