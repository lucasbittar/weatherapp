/**
 * Project Name: Weather App | Weather Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */
"use strict";

// Interfaces for Open-Meteo response and the structure App.tsx expects

// This is what App.tsx's WeatherInfo.currently expects
interface WeatherCurrentlyApp {
  apparentTemperature: number;
  summary: string; // e.g., "Cloudy", "Sunny"
  icon: string; // Skycon compatible icon string e.g., "CLOUDY"
  humidity?: number;
  windSpeed?: number;
  temperature?: number; // Actual temperature, if different from apparent
}

// This is the structure for the service's output, matching App.tsx's WeatherInfo
interface WeatherInfoServiceOutput {
  currently: WeatherCurrentlyApp;
  // Potentially other top-level keys like 'daily', 'hourly'
}

interface WeatherCodeMapping {
  summary: string;
  icon: string;
}

// Interface for the actual 'current' object from Open-Meteo
interface OpenMeteoCurrentData {
  time: string;
  interval: number;
  temperature_2m: number; // What was originally fetched
  apparent_temperature: number;
  weather_code: number; // WMO Weather interpretation codes (ww)
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

// Basic mapping from WMO code to a summary and Skycon-like icon string
// This is a simplified version. A more robust solution would be more comprehensive.
export function mapWeatherCode(code: number): { summary: string; icon: string } {
  // Based on https://open-meteo.com/en/docs WMO Weather interpretation codes
  if (code === 0) return { summary: "Clear sky", icon: "CLEAR_DAY" };
  if (code === 1) return { summary: "Mainly clear", icon: "PARTLY_CLOUDY_DAY" };
  if (code === 2)
    return { summary: "Partly cloudy", icon: "PARTLY_CLOUDY_DAY" };
  if (code === 3) return { summary: "Overcast", icon: "CLOUDY" };
  if (code >= 45 && code <= 48) return { summary: "Fog", icon: "FOG" };
  if (code >= 51 && code <= 55) return { summary: "Drizzle", icon: "RAIN" }; // RAIN can represent drizzle
  if (code >= 56 && code <= 57)
    return { summary: "Freezing Drizzle", icon: "SLEET" };
  if (code >= 61 && code <= 65) return { summary: "Rain", icon: "RAIN" };
  if (code >= 66 && code <= 67)
    return { summary: "Freezing Rain", icon: "SLEET" };
  if (code >= 71 && code <= 75) return { summary: "Snow fall", icon: "SNOW" };
  if (code === 77) return { summary: "Snow grains", icon: "SNOW" };
  if (code >= 80 && code <= 82)
    return { summary: "Rain showers", icon: "RAIN" };
  if (code >= 85 && code <= 86)
    return { summary: "Snow showers", icon: "SNOW" };
  if (code >= 95 && code <= 99)
    return { summary: "Thunderstorm", icon: "THUNDERSTORM_SHOWERS_DAY" }; // Assuming day, needs time context
  return { summary: "Unknown", icon: "CLOUDY" }; // Default fallback
}

/**
 * Fetches current weather information for given coordinates from Open-Meteo.
 *
 * @param lat - The latitude of the location.
 * @param lng - The longitude of the location.
 * @returns {Promise<WeatherInfoServiceOutput>} A promise that resolves with structured weather data.
 * @throws {Error} If the API request fails or returns invalid data.
 */
const getWeatherInfo = async ( lat: number, lng: number): Promise<WeatherInfoServiceOutput> => {

  console.log("Fetching weather info for:", lat, lng);

  // Requesting more fields from Open-Meteo
  const currentFields: string = "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m";
  const url: string = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=${currentFields}`;

  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      // If response is not OK, try to get error message from text body
      const errorText: string = await response.text();
      throw new Error(
        `Weather API request failed with status ${response.status}: ${errorText || "No error message body"}`,
      );
    }

    // Explicitly cast to OpenMeteoResponse to help TypeScript
    const data: OpenMeteoResponse = await response.json();

    if (!data || !data.current) {
      console.error("Unexpected response structure from Open-Meteo:", data);
      throw new Error(
        "Invalid weather data received from API. Missing expected fields.",
      );
    }

    const current = data.current;
    const { summary, icon }: WeatherCodeMapping = mapWeatherCode(
      current.weather_code,
    );

    const appWeatherData: WeatherInfoServiceOutput = {
      currently: {
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        summary: summary,
        icon: icon,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
      },
    };

    return appWeatherData; // Resolve the promise with the structured data
  } catch (err: any) {
    // Catch any errors that occur in the try block
    console.error("Weather API error:", err.message);
    throw new Error(err.message || "Failed to fetch weather data."); // Re-throw for upstream handling
  }
};

interface WeatherService {
  getInfo: (lat: number, lng: number) => Promise<WeatherInfoServiceOutput>;
}

const weatherService: WeatherService = {
  getInfo: getWeatherInfo,
};

export default weatherService;
