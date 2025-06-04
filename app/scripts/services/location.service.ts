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

interface AccuWeatherGeoPositionResponse {
  LocalizedName: string;
  AdministrativeArea: {
    LocalizedName: string;
    ID: string; // This is the state/region abbreviation
  };
  Country: {
    LocalizedName: string;
    ID: string; // Country code
  };
  // Add other fields if needed, e.g., Key for location key
}

interface LocationDetails {
  cityName: string;
  stateName: string;      // e.g., "California"
  stateAbbreviation: string; // e.g., "CA"
  countryName?: string;    // e.g., "United States" (if available)
  countryCode?: string;    // e.g., "US"
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

// Fetches user's location and returns city, state and abbreviation based on longitude and latitude
const getLocationInfo = function(): Promise<LocationDetails> {
  return new Promise((resolve, reject) => {
    getLocationCoordinates()
      .then(({ latitude, longitude }) => {
        const accuWeatherApiKey = 'uv8yUDGtAMuxYOy7NJbQbIAqqf4FD0cA';
        const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${accuWeatherApiKey}&q=${latitude},${longitude}&details=true`; // Added details=true for more info

        fetch(url)
          .then(response => {
            if (!response.ok) {
              // Try to parse error from AccuWeather if possible
              return response.json().then(errData => {
                const message = errData?.Message || `AccuWeather API request failed with status ${response.status}`;
                throw new Error(message);
              }).catch(() => {
                throw new Error(`AccuWeather API request failed with status ${response.status}`);
              });
            }
            return response.json() as Promise<AccuWeatherGeoPositionResponse>;
          })
          .then(data => {
            if (!data || !data.LocalizedName || !data.AdministrativeArea || !data.Country) {
                console.error('Unexpected response structure from AccuWeather:', data);
                throw new Error('Invalid location data received from AccuWeather');
            }
            const locationInfo: LocationDetails = {
              cityName: data.LocalizedName,
              stateName: data.AdministrativeArea.LocalizedName,
              stateAbbreviation: data.AdministrativeArea.ID,
              countryName: data.Country.LocalizedName,
              countryCode: data.Country.ID,
              latitude: latitude,
              longitude: longitude,
            };
            resolve(locationInfo);
          })
          .catch((err: Error) => {
            console.error('Error fetching location details:', err.message);
            reject(new Error(err.message || 'Failed to fetch location details'));
          });
      })
      .catch((err: Error) => {
        console.error('Error getting coordinates for location info:', err.message);
        reject(new Error(err.message || 'Failed to get coordinates'));
      });
  });
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
