import tipsService, { TipsRequest, TipsResponse } from './tips.service';

describe('TipsService', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTips', () => {
    const mockRequest: TipsRequest = {
      temperature: 72,
      temperatureUnit: 'F',
      weatherSummary: 'Partly Cloudy',
      cityName: 'San Francisco',
      stateName: 'California',
      countryName: 'USA',
      humidity: 65,
      windSpeed: 10,
    };

    const mockResponse: TipsResponse = {
      outfit: ['Light jacket', 'Comfortable shoes', 'Sunglasses'],
      activities: ['Walk in the park', 'Outdoor dining', 'Beach visit'],
      pointsOfInterest: [
        'Golden Gate Bridge',
        'Fisherman\'s Wharf',
        'Chinatown',
      ],
    };

    it('should return tips when API call is successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await tipsService.getTips(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });
    });

    it('should throw an error when API returns error response', async () => {
      const errorResponse = { error: 'Failed to generate tips' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      await expect(tipsService.getTips(mockRequest)).rejects.toThrow(
        'Failed to generate tips'
      );
    });

    it('should throw a generic error when API returns non-JSON error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(tipsService.getTips(mockRequest)).rejects.toThrow(
        'Failed to fetch tips: 500'
      );
    });

    it('should throw an error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(tipsService.getTips(mockRequest)).rejects.toThrow(
        'Network failure'
      );
    });

    it('should work with minimal required fields', async () => {
      const minimalRequest: TipsRequest = {
        temperature: 20,
        temperatureUnit: 'C',
        weatherSummary: 'Sunny',
        cityName: 'New York',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await tipsService.getTips(minimalRequest);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalRequest),
      });
    });
  });
});
