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

interface OpenCageLocationResponse {
  results: Array<{
    components: {
      city: string;
      state: string;
      state_code: string;
      country: string;
      country_code: string;
    };
  }>;
}

describe('LocationService', () => {
  let mockFetch: jest.Mock;
  let mockGetCurrentPosition: jest.Mock;
  let originalGeolocation: Geolocation | undefined;

  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;

  const mockOpenCageApiKey = 'TEST_OPEN_CAGE_API_KEY';

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

    process.env.OPEN_CAGE_API_KEY = mockOpenCageApiKey;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // @ts-ignore
    navigator.geolocation = originalGeolocation;
    delete process.env.OPEN_CAGE_API_KEY;
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
          toJSON: () => ({
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
        toJSON: function () {
          return {
            coords: this.coords,
            timestamp: this.timestamp,
          };
        },
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
        code: 1,
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
      const mockError: Partial<GeolocationPositionError> = { code: 1 };
      mockGetCurrentPosition.mockImplementationOnce((successCallback, errorCallback) => {
        errorCallback(mockError as GeolocationPositionError);
      });

      await expect(locationService.getCoordinates()).rejects.toThrow(
        'Error getting location coordinates'
      );
      expect(mockConsoleError).toHaveBeenCalledWith('Geolocation error:', undefined);
    });

    it('should reject with an error when navigator.geolocation is not available', async () => {
      // @ts-ignore
      navigator.geolocation = undefined;
      await expect(locationService.getCoordinates()).rejects.toThrow(
        'Geolocation is not supported by this browser.'
      );
    });
  });

  describe('getLocationInfo (locationService.getInfo)', () => {
    const mockCoords: Coordinates = { latitude: 34.0522, longitude: -118.2437 };
    const mockLocationApiResponse: OpenCageLocationResponse = {
      results: [
        {
          components: {
            city: 'Los Angeles',
            state: 'California',
            state_code: 'CA',
            country: 'United States',
            country_code: 'US',
          },
        },
      ],
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

    const mockGlobalPosition: GeolocationPosition = {
      coords: {
        latitude: mockCoords.latitude,
        longitude: mockCoords.longitude,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({
          ...mockCoords,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        }),
      },
      timestamp: Date.now(),
      toJSON: function () {
        return { coords: this.coords, timestamp: this.timestamp };
      },
    };

    const mockGlobalGeoError: GeolocationPositionError = {
      code: 1,
      message: 'Geo Test Error',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    it('should resolve with correct LocationDetails when both calls succeed', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLocationApiResponse,
      });

      await expect(locationService.getInfo()).resolves.toEqual(expectedLocationDetails);
      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.opencagedata.com/geocode/v1/json?key=${mockOpenCageApiKey}&q=${mockCoords.latitude},${mockCoords.longitude}&pretty=1&no_annotations=1`
      );
    });

    it('should reject if getLocationCoordinates rejects', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback, errorCallback) =>
        errorCallback(mockGlobalGeoError)
      );

      await expect(locationService.getInfo()).rejects.toThrow('Geo Test Error');
      expect(mockConsoleError).toHaveBeenCalledWith('Geolocation error:', 'Geo Test Error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'Geo Test Error'
      );
    });

    it('should reject if GeoLocation API call fails (network error)', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      const networkError = new Error('Network failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(locationService.getInfo()).rejects.toThrow('Network failed');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'Network failed'
      );
    });

    it('should reject if GeoLocation API returns an error response', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      const apiErrorResponse = { Message: 'Invalid API Key or Quota Exceeded' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => apiErrorResponse,
      });

      await expect(locationService.getInfo()).rejects.toThrow(
        'Invalid API Key or Quota Exceeded'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'Invalid API Key or Quota Exceeded'
      );
    });

    it('should reject if GeoLocation API returns an error response without Message', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      const apiErrorResponse = { Code: 'Unauthorized', Details: 'Some details' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => apiErrorResponse,
      });

      await expect(locationService.getInfo()).rejects.toThrow(
        'GeoLocation API request failed with status 401'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'GeoLocation API request failed with status 401'
      );
    });

    it('should reject with a generic message if GeoLocation error response is not JSON', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Malformed JSON');
        },
      });

      await expect(locationService.getInfo()).rejects.toThrow(
        'GeoLocation API request failed with status 500'
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Could not parse GeoLocation error response JSON:',
        expect.any(Error)
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'GeoLocation API request failed with status 500'
      );
    });

    it('should reject if GeoLocation API returns an empty response (or missing crucial fields)', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      const malformedResponse = {};
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
      });

      await expect(locationService.getInfo()).rejects.toThrow(
        'Invalid location data received from GeoLocation. Missing expected fields.'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unexpected response structure from GeoLocation:',
        malformedResponse
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'An error occurred during location info retrieval:',
        'Invalid location data received from GeoLocation. Missing expected fields.'
      );
    });

    it('should reject if GeoLocation API returns response with empty results array', async () => {
      mockGetCurrentPosition.mockImplementationOnce((successCallback) =>
        successCallback(mockGlobalPosition)
      );
      const emptyResultsResponse: OpenCageLocationResponse = { results: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResultsResponse,
      });

      // The service will throw when trying to access results[0].components
      await expect(locationService.getInfo()).rejects.toThrow();
    });
  });
});
