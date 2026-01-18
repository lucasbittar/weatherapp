import imageService, { ImageDetails, PexelsPhoto } from './image.service';

describe('ImageService', () => {
  let mockFetch: jest.Mock;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockMathRandom: jest.SpyInstance;

  const mockApiKeyValue = 'TEST_PEXELS_API_KEY';

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0); // Always pick first photo

    // Set up environment variables for each test
    process.env.PEXELS_API_KEY = mockApiKeyValue;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clear environment variables after each test
    delete process.env.PEXELS_API_KEY;
  });

  describe('searchImage', () => {
    const searchTerm = 'weather';

    it('should reject with an error if PEXELS_API_KEY is not defined', async () => {
      delete process.env.PEXELS_API_KEY;
      await expect(imageService.search(searchTerm)).rejects.toThrow(
        'PEXELS_API_KEY environment variable is not defined.'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'PEXELS_API_KEY environment variable is not defined.'
      );
    });

    it('should resolve with correct ImageDetails when API returns a successful response with photos', async () => {
      const mockPhoto: PexelsPhoto = {
        id: 12345,
        width: 1920,
        height: 1080,
        url: 'https://www.pexels.com/photo/12345',
        photographer: 'John Doe',
        photographer_url: 'https://www.pexels.com/@johndoe',
        photographer_id: 123,
        avg_color: '#AABBCC',
        src: {
          original: 'https://images.pexels.com/photos/12345/original.jpg',
          large2x: 'https://images.pexels.com/photos/12345/large2x.jpg',
          large: 'https://images.pexels.com/photos/12345/large.jpg',
          medium: 'https://images.pexels.com/photos/12345/medium.jpg',
          small: 'https://images.pexels.com/photos/12345/small.jpg',
          portrait: 'https://images.pexels.com/photos/12345/portrait.jpg',
          landscape: 'https://images.pexels.com/photos/12345/landscape.jpg',
          tiny: 'https://images.pexels.com/photos/12345/tiny.jpg',
        },
        liked: false,
        alt: 'A beautiful weather scene',
      };
      const mockImageData = {
        total_results: 1,
        page: 1,
        per_page: 15,
        photos: [mockPhoto],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      const expectedDetails: ImageDetails = {
        url: 'https://images.pexels.com/photos/12345/large2x.jpg',
        photographer: 'John Doe',
        photographerUrl: 'https://www.pexels.com/@johndoe',
        width: 1920,
        height: 1080,
      };

      await expect(imageService.search(searchTerm)).resolves.toEqual(expectedDetails);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.pexels.com/v1/search?query=${searchTerm}&orientation=landscape&per_page=15`,
        {
          headers: {
            Authorization: mockApiKeyValue,
          },
        }
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `Fetching image for: ${searchTerm} via Pexels API`
      );
    });

    it('should resolve with null when API returns a successful response with no photos', async () => {
      const mockImageData = { total_results: 0, page: 1, per_page: 15, photos: [] as PexelsPhoto[] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`No images found for: ${searchTerm}`);
    });

    it('should reject with an error when the API call fails (network error)', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(imageService.search(searchTerm)).rejects.toThrow('Network failure');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching image:', networkError);
    });

    it('should reject with an error when the API returns an error response (e.g., invalid API key)', async () => {
      const errorResponse = { error: 'Invalid API key' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      await expect(imageService.search(searchTerm)).rejects.toThrow(
        'API request failed with status 401: Invalid API key'
      );
      expect(mockConsoleError).toHaveBeenCalledWith('API Error:', errorResponse);
    });

    it('should reject with an error when the API error response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Malformed error JSON');
        },
      });

      await expect(imageService.search(searchTerm)).rejects.toThrow(
        'API request failed with status 500: Could not parse error response body.'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error parsing error JSON:',
        expect.any(Error)
      );
    });

    it('should reject with an error when the API successful response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(imageService.search(searchTerm)).rejects.toThrow('Invalid JSON');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching image:', expect.any(Error));
    });

    it('should resolve with null when data.photos is undefined in the API response', async () => {
      const mockImageData = { total_results: 0, page: 1, per_page: 15 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`No images found for: ${searchTerm}`);
    });

    it('should use large fallback if large2x is not available', async () => {
      const mockPhoto: PexelsPhoto = {
        id: 12345,
        width: 1920,
        height: 1080,
        url: 'https://www.pexels.com/photo/12345',
        photographer: 'Jane Doe',
        photographer_url: 'https://www.pexels.com/@janedoe',
        photographer_id: 456,
        avg_color: '#DDEEFF',
        src: {
          original: 'https://images.pexels.com/photos/12345/original.jpg',
          large2x: '',
          large: 'https://images.pexels.com/photos/12345/large.jpg',
          medium: 'https://images.pexels.com/photos/12345/medium.jpg',
          small: 'https://images.pexels.com/photos/12345/small.jpg',
          portrait: 'https://images.pexels.com/photos/12345/portrait.jpg',
          landscape: 'https://images.pexels.com/photos/12345/landscape.jpg',
          tiny: 'https://images.pexels.com/photos/12345/tiny.jpg',
        },
        liked: false,
        alt: 'A beautiful scene',
      };
      const mockImageData = {
        total_results: 1,
        page: 1,
        per_page: 15,
        photos: [mockPhoto],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      const result = await imageService.search(searchTerm);
      expect(result?.url).toBe('https://images.pexels.com/photos/12345/large.jpg');
    });
  });
});
