import weatherService, { mapWeatherCode } from './weather.service';

// Replicating interfaces for test clarity, though some might be implicitly typed
interface WeatherCurrentlyApp {
  apparentTemperature: number;
  summary: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  temperature?: number;
}

interface WeatherInfoServiceOutput {
  currently: WeatherCurrentlyApp;
}

interface OpenMeteoCurrentData {
  time: string;
  interval: number;
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: OpenMeteoCurrentData;
}

describe('WeatherService', () => {
  let mockFetch: jest.Mock;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mapWeatherCode', () => {
    const testCases = [
      { code: 0, expected: { summary: "Clear sky", icon: "CLEAR_DAY" } },
      { code: 1, expected: { summary: "Mainly clear", icon: "PARTLY_CLOUDY_DAY" } },
      { code: 2, expected: { summary: "Partly cloudy", icon: "PARTLY_CLOUDY_DAY" } },
      { code: 3, expected: { summary: "Overcast", icon: "CLOUDY" } },
      { code: 45, expected: { summary: "Fog", icon: "FOG" } },
      { code: 48, expected: { summary: "Fog", icon: "FOG" } },
      { code: 51, expected: { summary: "Drizzle", icon: "RAIN" } },
      { code: 53, expected: { summary: "Drizzle", icon: "RAIN" } },
      { code: 55, expected: { summary: "Drizzle", icon: "RAIN" } },
      { code: 56, expected: { summary: "Freezing Drizzle", icon: "SLEET" } },
      { code: 57, expected: { summary: "Freezing Drizzle", icon: "SLEET" } },
      { code: 61, expected: { summary: "Rain", icon: "RAIN" } },
      { code: 63, expected: { summary: "Rain", icon: "RAIN" } },
      { code: 65, expected: { summary: "Rain", icon: "RAIN" } },
      { code: 66, expected: { summary: "Freezing Rain", icon: "SLEET" } },
      { code: 67, expected: { summary: "Freezing Rain", icon: "SLEET" } },
      { code: 71, expected: { summary: "Snow fall", icon: "SNOW" } },
      { code: 73, expected: { summary: "Snow fall", icon: "SNOW" } },
      { code: 75, expected: { summary: "Snow fall", icon: "SNOW" } },
      { code: 77, expected: { summary: "Snow grains", icon: "SNOW" } },
      { code: 80, expected: { summary: "Rain showers", icon: "RAIN" } },
      { code: 81, expected: { summary: "Rain showers", icon: "RAIN" } },
      { code: 82, expected: { summary: "Rain showers", icon: "RAIN" } },
      { code: 85, expected: { summary: "Snow showers", icon: "SNOW" } },
      { code: 86, expected: { summary: "Snow showers", icon: "SNOW" } },
      { code: 95, expected: { summary: "Thunderstorm", icon: "THUNDERSTORM_SHOWERS_DAY" } },
      { code: 96, expected: { summary: "Thunderstorm", icon: "THUNDERSTORM_SHOWERS_DAY" } }, // Assuming 96, 99 are similar
      { code: 99, expected: { summary: "Thunderstorm", icon: "THUNDERSTORM_SHOWERS_DAY" } },
      { code: 100, expected: { summary: "Unknown", icon: "CLOUDY" } }, // Unknown code
      { code: -5, expected: { summary: "Unknown", icon: "CLOUDY" } }, // Another unknown
    ];

    testCases.forEach(tc => {
      it(`should map WMO code ${tc.code} to summary "${tc.expected.summary}" and icon "${tc.expected.icon}"`, () => {
        expect(mapWeatherCode(tc.code)).toEqual(tc.expected);
      });
    });
  });

  describe('getWeatherInfo (weatherService.getInfo)', () => {
    const lat = 34.05;
    const lon = -118.25; // LA

    const mockApiCurrentData: OpenMeteoCurrentData = {
      time: "2023-10-26T12:00",
      interval: 3600,
      temperature_2m: 22.5,
      apparent_temperature: 23.1,
      weather_code: 3, // Overcast
      relative_humidity_2m: 60,
      wind_speed_10m: 15.5,
    };

    const mockApiResponse: OpenMeteoResponse = {
      latitude: lat,
      longitude: lon,
      generationtime_ms: 0.5,
      utc_offset_seconds: 0,
      timezone: "GMT",
      timezone_abbreviation: "GMT",
      elevation: 100,
      current_units: {},
      current: mockApiCurrentData,
    };

    const expectedServiceOutput: WeatherInfoServiceOutput = {
      currently: {
        temperature: 22.5,
        apparentTemperature: 23.1,
        summary: "Overcast", // from mapWeatherCode(3)
        icon: "CLOUDY",    // from mapWeatherCode(3)
        humidity: 60,
        windSpeed: 15.5,
      },
    };

    it('should resolve with correct WeatherInfoServiceOutput when API call succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await expect(weatherService.getInfo(lat, lon)).resolves.toEqual(expectedServiceOutput);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith("Fetching weather info for:", lat, lon);
    });

    it('should correctly use mapWeatherCode for a different weather code', async () => {
        const slightlyDifferentResponse: OpenMeteoResponse = {
            ...mockApiResponse,
            current: {
                ...mockApiCurrentData,
                weather_code: 0, // Clear Sky
            }
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => slightlyDifferentResponse,
        });

        const expectedOutput: WeatherInfoServiceOutput = {
          currently: {
            ...expectedServiceOutput.currently,
            summary: "Clear sky",
            icon: "CLEAR_DAY",
          },
        };
        await expect(weatherService.getInfo(lat, lon)).resolves.toEqual(expectedOutput);
      });

    it('should reject with an error when the API call fails (network error)', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(weatherService.getInfo(lat, lon)).rejects.toThrow('Network failure');
      expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", "Network failure");
    });

    it('should reject with an error when the API returns an error response', async () => {
      const errorText = 'Invalid request parameters';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => errorText,
      });

      await expect(weatherService.getInfo(lat, lon)).rejects.toThrow(
        `Weather API request failed with status 400: ${errorText}`
      );
      expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", `Weather API request failed with status 400: ${errorText}`);
    });

    it('should reject with an error when the API returns an error response with no text body', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "", // Empty error body
        });

        await expect(weatherService.getInfo(lat, lon)).rejects.toThrow(
          `Weather API request failed with status 500: No error message body`
        );
        expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", `Weather API request failed with status 500: No error message body`);
      });


    it('should reject with an error when API response is not valid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error("Malformed JSON"); },
      });

      await expect(weatherService.getInfo(lat, lon)).rejects.toThrow("Malformed JSON");
      expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", "Malformed JSON");
    });

    it('should reject with an error when API response is missing "current" data', async () => {
      const malformedResponse = { ...mockApiResponse, current: undefined } as any; // Missing current
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
      });

      await expect(weatherService.getInfo(lat, lon)).rejects.toThrow(
        "Invalid weather data received from API. Missing expected fields."
      );
      expect(mockConsoleError).toHaveBeenCalledWith("Unexpected response structure from Open-Meteo:", malformedResponse);
      expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", "Invalid weather data received from API. Missing expected fields.");
    });

    it('should reject with an error when API response data is null', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async (): Promise<null> => null, // API returns null, explicitly typed
        });

        await expect(weatherService.getInfo(lat, lon)).rejects.toThrow(
          "Invalid weather data received from API. Missing expected fields."
        );
        // Note: The first console.error in the service will log 'null' as the data.
        expect(mockConsoleError).toHaveBeenCalledWith("Unexpected response structure from Open-Meteo:", null);
        expect(mockConsoleError).toHaveBeenCalledWith("Weather API error:", "Invalid weather data received from API. Missing expected fields.");
      });
  });
});
