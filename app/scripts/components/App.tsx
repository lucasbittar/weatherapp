import { useState, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import locationService from '../services/location.service';
import weatherService from '../services/weather.service';
import imageService from '../services/image.service';
import formatService from '../services/format.service';
import tipsService, { TipsResponse } from '../services/tips.service';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Import components
import LoadingIndicator from './LoadingIndicator';
import LocationDisplay from './LocationDisplay';
import TemperatureDisplay from './TemperatureDisplay';
import WeatherDescription from './WeatherDescription';
import UnitConverter from './UnitConverter';
import WeatherStats from './WeatherStats';
import WeatherTips from './WeatherTips';
import GlitchImage from './GlitchImage';
import '../../styles/tailwind.css';

// Interfaces
interface LocationInfo {
  latitude: number;
  longitude: number;
  cityName: string;
  countryName?: string;
  stateName?: string;
  stateAbbreviation?: string;
}

interface WeatherInfo {
  currently: {
    apparentTemperature: number;
    summary: string;
    icon: string;
    humidity?: number;
    windSpeed?: number;
    temperature?: number;
  };
}

interface ImageInfo {
  url: string;
  photographer: string;
  photographerUrl: string;
  width?: number;
  height?: number;
}

const AppContent: FC = () => {
  const [currentUnit, setCurrentUnit] = useState<string>('C');
  const { theme, colors } = useTheme();

  // 1. Location Query
  const {
    data: locationData,
    isLoading: isLocationLoading,
    isError: isLocationError,
    error: locationError,
  } = useQuery<LocationInfo, Error>({
    retry: false,
    queryKey: ['location'],
    queryFn: locationService.getInfo,
    staleTime: Infinity,
  });

  // 2. Weather Query
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    error: weatherError,
  } = useQuery<WeatherInfo, Error>({
    queryKey: ['weather', locationData?.latitude, locationData?.longitude],
    queryFn: () => {
      if (!locationData) throw new Error('Location not available');
      return weatherService.getInfo(locationData.latitude, locationData.longitude);
    },
    enabled: !!locationData,
    staleTime: 8640000,
  });

  // 3. Image Query
  const {
    data: imageData,
    isLoading: isImageLoading,
    isError: isImageError,
    error: imageError,
  } = useQuery<ImageInfo | null, Error>({
    queryKey: ['image', locationData?.cityName],
    queryFn: () => {
      if (!locationData?.cityName) throw new Error('City not available');
      return imageService.search(`${locationData.cityName} ${locationData.stateName}`);
    },
    enabled: !!locationData?.cityName,
    staleTime: Infinity,
  });

  // 4. Tips Query (Gemini AI)
  const {
    data: tipsData,
    isLoading: isTipsLoading,
    isError: isTipsError,
    error: tipsError,
  } = useQuery<TipsResponse, Error>({
    queryKey: ['tips', locationData?.cityName, weatherData?.currently?.summary, currentUnit],
    queryFn: () => {
      if (!locationData || !weatherData) throw new Error('Data not available');
      const temp = currentUnit === 'C'
        ? weatherData.currently.apparentTemperature
        : formatService.celsiusFahrenheit(weatherData.currently.apparentTemperature);
      return tipsService.getTips({
        temperature: Math.round(temp),
        temperatureUnit: currentUnit as 'C' | 'F',
        weatherSummary: weatherData.currently.summary,
        cityName: locationData.cityName,
        stateName: locationData.stateName,
        countryName: locationData.countryName,
        humidity: weatherData.currently.humidity,
        windSpeed: weatherData.currently.windSpeed,
      });
    },
    enabled: !!locationData && !!weatherData,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });

  const isLoading = isLocationLoading || (!!locationData && (isWeatherLoading || isImageLoading));
  const allDataLoaded = !!locationData && !!weatherData && imageData !== undefined;
  const any_dependent_error = !!locationData && (isWeatherError || isImageError);

  const errorMessage = (): string => {
    if (isLocationError) return `LOCATION_ERROR: ${locationError?.message}`;
    if (any_dependent_error) {
      if (isWeatherError) return `WEATHER_ERROR: ${weatherError?.message}`;
      if (isImageError) return `IMAGE_ERROR: ${imageError?.message}`;
    }
    return '';
  };

  // Theme-aware color classes
  const primaryColor = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const dimColor = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';
  const brightColor = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const borderColor = theme === 'amber' ? 'border-crt-amber/60' : 'border-crt-green/60';
  const glowStyle = theme === 'amber'
    ? { boxShadow: '0 0 20px rgba(255, 176, 0, 0.15), inset 0 0 40px rgba(255, 176, 0, 0.03)' }
    : { boxShadow: '0 0 20px rgba(0, 255, 65, 0.15), inset 0 0 40px rgba(0, 255, 65, 0.03)' };

  return (
    <>
      <LoadingIndicator hidden={!isLoading && allDataLoaded} error={errorMessage()} theme={theme} />

      <div className={`crt-screen min-h-screen ${allDataLoaded ? 'block' : 'hidden'}`}>
        {/* Glitch Image Background */}
        {imageData && imageData.url && (
          <GlitchImage imageUrl={imageData.url} intensity="medium" theme={theme} />
        )}

        {/* CRT Effects Overlay */}
        <div className="crt-scanlines" />
        <div className="crt-curve" />
        <div className="crt-noise" />
        <div className={theme === 'amber' ? 'crt-scanline-bar' : 'crt-scanline-bar-green'} />

        {/* Main Terminal Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
          {/* Terminal Window */}
          <div
            className={`w-full max-w-lg border ${borderColor} bg-crt-black/80 backdrop-blur-sm`}
            style={glowStyle}
          >
            {/* Terminal Header */}
            <div className={`border-b ${borderColor} px-4 py-2`}>
              <div className={`font-mono text-sm flex justify-between items-center`}>
                <span className={dimColor}>
                  [<span className={brightColor} style={{ textShadow: `0 0 8px ${colors.primary}` }}>
                    WEATHER_TERMINAL
                  </span>] v3.0
                </span>
                <span className={primaryColor}>
                  ONLINE <span className="animate-pulse">●</span>
                </span>
              </div>
            </div>

            {/* Weather Content */}
            <div className="px-4 py-6">
              {/* Location */}
              {locationData && formatService && (
                <LocationDisplay locationData={locationData} formatService={formatService} theme={theme} />
              )}

              {/* Temperature */}
              {weatherData && formatService && (
                <TemperatureDisplay
                  weatherData={weatherData}
                  unit={currentUnit}
                  formatService={formatService}
                  theme={theme}
                />
              )}

              {/* Weather Icon & Description */}
              {weatherData && <WeatherDescription weatherData={weatherData} theme={theme} />}

              {/* Unit Toggle */}
              <UnitConverter currentUnit={currentUnit} setCurrentUnit={setCurrentUnit} theme={theme} />

              {/* Weather Stats */}
              {weatherData && (
                <WeatherStats
                  humidity={weatherData.currently.humidity}
                  windSpeed={weatherData.currently.windSpeed}
                  feelsLike={weatherData.currently.apparentTemperature}
                  actualTemp={weatherData.currently.temperature}
                  unit={currentUnit}
                  theme={theme}
                />
              )}

              {/* AI Weather Tips */}
              {weatherData && locationData && (
                <WeatherTips
                  tips={tipsData as TipsResponse}
                  isLoading={isTipsLoading}
                  error={isTipsError ? (tipsError?.message || 'Failed to load tips') : null}
                  theme={theme}
                />
              )}
            </div>

            {/* Terminal Footer */}
            <div className={`border-t ${borderColor} px-4 py-2`}>
              <div className={`font-mono text-xs ${dimColor} flex flex-col sm:flex-row sm:justify-between gap-1`}>
                <span>
                  {'>'} IMG:{' '}
                  {imageData && imageData.photographer && (
                    <a
                      href={imageData.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${primaryColor} hover:underline`}
                    >
                      {imageData.photographer.toUpperCase()}
                    </a>
                  )}{' '}
                  @ PEXELS
                </span>
                <span>
                  {'>'} BY:{' '}
                  <a
                    href="https://www.lucasbittar.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${primaryColor} hover:underline`}
                  >
                    LUCAS_BITTAR
                  </a>
                </span>
              </div>
            </div>

            {/* Command prompt - waiting for input */}
            <div className={`px-4 py-3 border-t ${borderColor}`}>
              <div className={`font-mono text-sm ${primaryColor}`}>
                {'>'} <span className="animate-cursor-blink">█</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const App: FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
