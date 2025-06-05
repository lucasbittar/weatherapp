import locationService from './location.service';

// Replicating interfaces here as they are not exported from the service
interface Coordinates {
  latitude: number;
  longitude: number;
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

interface AccuWeatherGeoPositionResponse {
  LocalizedName: string;
  AdministrativeArea: {
    LocalizedName: string;
    ID: string;
  };
  Country: {
    LocalizedName: string;
    ID: string;
  };
  // Add other fields if necessary based on actual API responses or service usage
}


describe('LocationService', () => {
  let mockFetch: jest.Mock;
  let mockGetCurrentPosition: jest.Mock;
  let originalGeolocation: Geolocation | undefined;

  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;

  const mockAccuWeatherApiKey = 'TEST_ACCUWEATHER_API_KEY';

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockGetCurrentPosition = jest.fn();
    originalGeolocation = navigator.geolocation;
    // @ts-ignore
    navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition,
    };

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    process.env.ACCUWEATHER_API_KEY = mockAccuWeatherApiKey;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // @ts-ignore
    navigator.geolocation = originalGeolocation;
    delete process.env.ACCUWEATHER_API_KEY;
  });

  describe('getLocationCoordinates (locationService.getCoordinates)', () => {
    it('should resolve with correct Coordinates when navigator.geolocation.getCurrentPosition succeeds', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 12.34,
          longitude: 56.78,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({ // Add toJSON mock
            latitude: 12.34,
            longitude: 56.78,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          }),
        },
        timestamp: Date.now(),
        toJSON: function() { // Add toJSON to GeolocationPosition mock
          return {
            coords: this.coords,
            timestamp: this.timestamp,
          };
        }
      };
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => {
        successCallback(mockPosition);
      });

      const expectedCoordinates: Coordinates = {
        latitude: 12.34,
        longitude: 56.78,
      };
      await expect(locationService.getCoordinates()).resolves.toEqual(expectedCoordinates);
      expect(mockConsoleLog).toHaveBeenCalledWith('Fetching location...');
    });

    it('should reject with an error when navigator.geolocation.getCurrentPosition fails', async () => {
      const mockError: GeolocationPositionError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };
      mockGetCurrentPosition.mockImplementationOnce((successCallback, errorCallback) => {
        errorCallback(mockError);
      });

      await expect(locationService.getCoordinates()).rejects.toThrow('User denied Geolocation');
      expect(mockConsoleError).toHaveBeenCalledWith('Geolocation error:', 'User denied Geolocation');
    });

    it('should reject with an error message if error callback is called with no message', async () => {
        const mockError: Partial<GeolocationPositionError> = { code: 1 }; // No message
        mockGetCurrentPosition.mockImplementationOnce((successCallback, errorCallback) => {
          errorCallback(mockError as GeolocationPositionError);
        });

        await expect(locationService.getCoordinates()).rejects.toThrow('Error getting location coordinates');
        expect(mockConsoleError).toHaveBeenCalledWith('Geolocation error:', undefined); // service uses err.message which is undefined
      });

    it('should reject with an error when navigator.geolocation is not available', async () => {
      // @ts-ignore
      navigator.geolocation = undefined;
      await expect(locationService.getCoordinates()).rejects.toThrow('Geolocation is not supported by this browser.');
    });
  });

  describe('getLocationInfo (locationService.getInfo)', () => {
    const mockCoords: Coordinates = { latitude: 34.0522, longitude: -118.2437 }; // LA
    const mockLocationApiResponse: AccuWeatherGeoPositionResponse = {
      LocalizedName: 'Los Angeles',
      AdministrativeArea: { LocalizedName: 'California', ID: 'CA' },
      Country: { LocalizedName: 'United States', ID: 'US' },
    };

    const expectedLocationDetails: LocationDetails = {
      cityName: 'Los Angeles',
      stateName: 'California',
      stateAbbreviation: 'CA',
      countryName: 'United States',
      countryCode: 'US',
      latitude: mockCoords.latitude,
      longitude: mockCoords.longitude,
    };

    // Mock position for cases where getLocationCoordinates is expected to succeed
    const mockGlobalPosition: GeolocationPosition = {
      coords: {
        latitude: mockCoords.latitude,
        longitude: mockCoords.longitude,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({...mockCoords, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null }),
      },
      timestamp: Date.now(),
      toJSON: function() { return { coords: this.coords, timestamp: this.timestamp }; }
    };

    const mockGlobalGeoError: GeolocationPositionError = {
        code: 1, message: 'Geo Test Error', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3,
    };


    // No longer using getCoordinatesSpy, will mock navigator.geolocation.getCurrentPosition directly for these tests.

    it('should resolve with correct LocationDetails when both calls succeed', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocationApiResponse,
      });

      await expect(locationService.getInfo()).resolves.toEqual(expectedLocationDetails);
      expect(mockGetCurrentPosition).toHaveBeenCalled(); // Verify that the geo call was made
      expect(mockFetch).toHaveBeenCalledWith(
        `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${mockAccuWeatherApiKey}&q=${mockCoords.latitude},${mockCoords.longitude}&details=true`
      );
    });

    it('should reject if ACCUWEATHER_API_KEY is missing', async () => {
      delete process.env.ACCUWEATHER_API_KEY;
      // getLocationCoordinates will be called, so its mock needs to be set up to succeed,
      // otherwise, it might fail before the API key check.
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));

      await expect(locationService.getInfo()).rejects.toThrow('ACCUWEATHER_API_KEY environment variable is not defined.');
      expect(mockConsoleError).toHaveBeenCalledWith('ACCUWEATHER_API_KEY environment variable is not defined.');
    });


    it('should reject if getLocationCoordinates rejects', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback, errorCallback) => errorCallback(mockGlobalGeoError));

      await expect(locationService.getInfo()).rejects.toThrow('Geo Test Error');
      // The console error from getLocationCoordinates itself + the one from getLocationInfo's catch block
      expect(mockConsoleError).toHaveBeenCalledWith('Geolocation error:', 'Geo Test Error');
      expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'Geo Test Error');
    });

    it('should reject if AccuWeather API call fails (network error)', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
      const networkError = new Error('Network failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(locationService.getInfo()).rejects.toThrow('Network failed');
      expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'Network failed');
    });

    it('should reject if AccuWeather API returns an error response', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
      const apiErrorResponse = { Message: 'Invalid API Key or Quota Exceeded' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => apiErrorResponse,
      });

      await expect(locationService.getInfo()).rejects.toThrow('Invalid API Key or Quota Exceeded');
      // expect(mockConsoleError).toHaveBeenCalledWith('API Error:', apiErrorResponse); // This was incorrect based on current service code
      expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'Invalid API Key or Quota Exceeded');

    });

    it('should reject if AccuWeather API returns an error response without Message', async () => {
        mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
        const apiErrorResponse = { Code: 'Unauthorized', Details: 'Some details' }; // No Message field
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => apiErrorResponse,
        });

        await expect(locationService.getInfo()).rejects.toThrow('AccuWeather API request failed with status 401');
        // expect(mockConsoleError).toHaveBeenCalledWith('API Error:', apiErrorResponse); // This was incorrect
        expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'AccuWeather API request failed with status 401');
      });

      it('should reject with a generic message if AccuWeather error response is not JSON', async () => {
        mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => { throw new Error("Malformed JSON"); },
        });

        await expect(locationService.getInfo()).rejects.toThrow('AccuWeather API request failed with status 500');
        expect(mockConsoleWarn).toHaveBeenCalledWith('Could not parse AccuWeather error response JSON:', expect.any(Error));
        // This is logged by the catch block in getLocationInfo
        expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'AccuWeather API request failed with status 500');
      });

    it('should reject if AccuWeather API returns an empty response (or missing crucial fields)', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
      const malformedResponse = {}; // Missing LocalizedName, AdministrativeArea, Country
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
      });

      await expect(locationService.getInfo()).rejects.toThrow('Invalid location data received from AccuWeather. Missing expected fields.');
      expect(mockConsoleError).toHaveBeenCalledWith('Unexpected response structure from AccuWeather:', malformedResponse);
      // This is logged by the catch block in getLocationInfo
      expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'Invalid location data received from AccuWeather. Missing expected fields.');
    });

    it('should reject if AccuWeather API returns response with some crucial fields missing', async () => {
        mockGetCurrentPosition.mockImplementationOnce((successCallback) => successCallback(mockGlobalPosition));
        const partialResponse = { LocalizedName: 'City Only' }; // Missing AdministrativeArea, Country
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => partialResponse,
        });

        await expect(locationService.getInfo()).rejects.toThrow('Invalid location data received from AccuWeather. Missing expected fields.');
        expect(mockConsoleError).toHaveBeenCalledWith('Unexpected response structure from AccuWeather:', partialResponse);
        // This is logged by the catch block in getLocationInfo
        expect(mockConsoleError).toHaveBeenCalledWith('An error occurred during location info retrieval:', 'Invalid location data received from AccuWeather. Missing expected fields.');
      });
  });
});
