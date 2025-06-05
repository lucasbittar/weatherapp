import imageService, { ImageDetails, GoogleSearchImageItem } from './image.service';

describe('ImageService', () => {
  let mockFetch: jest.Mock;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const mockApiKeyValue = 'TEST_API_KEY';
  const mockCxValue = 'TEST_CX';

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up environment variables for each test
    process.env.API_KEY = mockApiKeyValue;
    process.env.CX = mockCxValue;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clear environment variables after each test
    delete process.env.API_KEY;
    delete process.env.CX;
  });

  describe('searchImage', () => {
    const searchTerm = 'weather';

    it('should reject with an error if API_KEY is not defined', async () => {
      delete process.env.API_KEY;
      await expect(imageService.search(searchTerm)).rejects.toThrow('API_KEY or CX environment variable is not defined.');
      expect(mockConsoleError).toHaveBeenCalledWith('API_KEY or CX environment variable is not defined.');
    });

    it('should reject with an error if CX is not defined', async () => {
      delete process.env.CX;
      await expect(imageService.search(searchTerm)).rejects.toThrow('API_KEY or CX environment variable is not defined.');
      expect(mockConsoleError).toHaveBeenCalledWith('API_KEY or CX environment variable is not defined.');
    });

    it('should resolve with correct ImageDetails when API returns a successful response with items', async () => {
      const mockApiItem: GoogleSearchImageItem = {
        link: 'http://example.com/image.jpg',
        mime: 'image/jpeg',
        image: {
          width: 800,
          height: 600,
          contextLink: 'http://example.com/context',
        },
      };
      const mockImageData = { items: [mockApiItem] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      const expectedDetails: ImageDetails = {
        url: 'http://example.com/image.jpg',
        type: 'image/jpeg',
        width: 800,
        height: 600,
        contextLink: 'http://example.com/context',
      };

      await expect(imageService.search(searchTerm)).resolves.toEqual(expectedDetails);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://www.googleapis.com/customsearch/v1?key=${mockApiKeyValue}&cx=${mockCxValue}&q=${searchTerm}&searchType=image&imgSize=xxlarge`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(`Fetching image for: ${searchTerm} via Google CSE API`);
    });

    it('should resolve with null when API returns a successful response with no items', async () => {
      const mockImageData: { items: GoogleSearchImageItem[] } = { items: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`No images found for: ${searchTerm}`);
    });

    it('should resolve with null when API returns items but the first item has no link', async () => {
      const mockApiItem: Partial<GoogleSearchImageItem> = { // Use Partial for incomplete item
        // link is missing
        mime: 'image/jpeg',
        image: {
          width: 800,
          height: 600,
          contextLink: 'http://example.com/context',
        },
      };
      const mockImageData = { items: [mockApiItem as GoogleSearchImageItem] }; // Cast to full type
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`First image item is missing link or image details for: ${searchTerm}`);
    });

    it('should resolve with null when API returns items but the first item has no image details', async () => {
        const mockApiItem: Partial<GoogleSearchImageItem> = {
          link: 'http://example.com/image.jpg',
          mime: 'image/jpeg',
          // image property is missing
        };
        const mockImageData = { items: [mockApiItem as GoogleSearchImageItem] };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockImageData,
        });

        await expect(imageService.search(searchTerm)).resolves.toBeNull();
        expect(mockConsoleLog).toHaveBeenCalledWith(`First image item is missing link or image details for: ${searchTerm}`);
      });

    it('should reject with an error when the API call fails (network error)', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(imageService.search(searchTerm)).rejects.toThrow('Network failure');
      // The actual service logs the error object, not just the message for fetch failures
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching image:', networkError);
    });

    it('should reject with an error when the API returns an error response (e.g., invalid API key)', async () => {
      const errorResponse = { error: { message: 'Invalid API key' } };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse, // This mock will be used by response.json()
      });

      await expect(imageService.search(searchTerm)).rejects.toThrow('API request failed with status 400: Invalid API key');
      expect(mockConsoleError).toHaveBeenCalledWith('API Error:', errorResponse);
    });

    it('should reject with an error when the API returns an error response and error.message is not available', async () => {
        const errorResponse = { error: { code: 403, details: "Forbidden" } }; // No message field
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => errorResponse,
        });

        await expect(imageService.search(searchTerm)).rejects.toThrow('API request failed with status 403: Unknown error');
        expect(mockConsoleError).toHaveBeenCalledWith('API Error:', errorResponse);
      });

    it('should reject with an error when the API error response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, // API error
        status: 500,
        json: async () => { throw new Error('Malformed error JSON'); }, // This error occurs when response.json() is called
      });

      // The service attempts to parse the error, fails, and then rejects.
      await expect(imageService.search(searchTerm)).rejects.toThrow('API request failed with status 500: Could not parse error response body.');
      expect(mockConsoleError).toHaveBeenCalledWith('Error parsing error JSON:', expect.any(Error));
    });


    it('should reject with an error when the API successful response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true, // API call itself is fine
        json: async () => { throw new Error('Invalid JSON'); }, // but the response body is malformed
      });

      // This error is caught by the final .catch in the promise chain in searchImage
      await expect(imageService.search(searchTerm)).rejects.toThrow('Invalid JSON');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching image:', expect.any(Error));
    });


    it('should resolve with null when data.items is undefined in the API response', async () => {
      const mockImageData = {}; // No items property
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`No images found for: ${searchTerm}`);
    });

    it('should resolve with null when data.items is null in the API response', async () => {
      const mockImageData: { items: GoogleSearchImageItem[] | null } = { items: null }; // items is null
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockImageData,
      });

      await expect(imageService.search(searchTerm)).resolves.toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(`No images found for: ${searchTerm}`);
    });
  });
});
