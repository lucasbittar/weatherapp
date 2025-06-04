import React, { useState, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import locationService from '../services/location.service';
import weatherService from '../services/weather.service';
import imageService from '../services/image.service';
import formatService from '../services/format.service';

// Import components
import LoadingIndicator from './LoadingIndicator';
import LocationDisplay from './LocationDisplay';
import TemperatureDisplay from './TemperatureDisplay';
import WeatherDescription from './WeatherDescription';
import UnitConverter from './UnitConverter';
import '../../styles/main.css';

// Import service return types (assuming they are exported from service files or a central types file)
// For this refactor, we'll use the interfaces as previously defined in this file,
// but ensure they match the actual service return shapes.

// LocationDetails from location.service.ts
interface LocationInfo { // Renaming from LocationDetails for consistency with previous App.tsx
  latitude: number;
  longitude: number;
  cityName: string;
  countryName?: string;
  stateName?: string; // Was regionName; stateName is more accurate from service
  stateAbbreviation?: string;
}

// WeatherInfoServiceOutput from weather.service.ts
interface WeatherInfo { // Renaming for consistency
  currently: {
    apparentTemperature: number;
    summary: string;
    icon: string;
    humidity?: number;
    windSpeed?: number;
    temperature?: number;
  };
}

// ImageDetails from image.service.ts
interface ImageInfo { // Renaming for consistency
  url: string;
  type?: string;
  width?: number;
  height?: number;
  contextLink?: string;
}

// FormatDetails from format.service.ts (remains the same)
interface FormatDetails {
  greeting: string;
  backgroundColor: string;
}


const App: FC = () => {
  const [currentUnit, setCurrentUnit] = useState<string>('F');

  // 1. Location Query
  const {
    data: locationData, // Renamed from locationInfo to avoid conflict if old state is still momentarily active
    isLoading: isLocationLoading,
    isError: isLocationError,
    error: locationError,
  } = useQuery<LocationInfo, Error>({ // Explicitly type data and error
    queryKey: ['location'],
    queryFn: locationService.getInfo,
    staleTime: Infinity, // Location data is unlikely to change during session
  });

  // 2. Weather Query (dependent on locationData)
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    error: weatherError,
  } = useQuery<WeatherInfo, Error>({
    queryKey: ['weather', locationData?.latitude, locationData?.longitude],
    queryFn: () => {
      if (!locationData) throw new Error("Location not available for weather query");
      return weatherService.getInfo(locationData.latitude, locationData.longitude);
    },
    enabled: !!locationData, // Only run if locationData is available
    staleTime: 1000 * 60 * 10, // Cache weather data for 10 minutes
  });

  // 3. Image Query (dependent on locationData)
  const {
    data: imageData,
    isLoading: isImageLoading,
    isError: isImageError,
    error: imageError,
  } = useQuery<ImageInfo | null, Error>({ // Image service can return null
    queryKey: ['image', locationData?.cityName],
    queryFn: () => {
      if (!locationData?.cityName) throw new Error("City name not available for image query");
      return imageService.search(locationData.cityName);
    },
    enabled: !!locationData?.cityName, // Only run if cityName is available
    staleTime: Infinity, // Image data for a city is unlikely to change frequently
  });

  // Overall loading state: true if any of the primary queries are loading
  const isLoading = isLocationLoading || (!!locationData && (isWeatherLoading || isImageLoading));

  // Content visibility: true if all enabled queries are successful and have data
  // This replaces the old `contentVisible` and `setIsLoading(false)` logic
  const allDataLoaded = !!locationData && !!weatherData && (imageData !== undefined); // imageData can be null

  // Error handling: display first error encountered
  if (isLocationError) {
    return (
      <div className="weather-bg">
        <span className="loader elements-show">Error fetching location: {locationError?.message}</span>
      </div>
    );
  }
  // Show specific errors for dependent queries if location succeeded
  const any_dependent_error = (!!locationData && (isWeatherError || isImageError));
  if (any_dependent_error) {
    // You could display a more nuanced error message here,
    // indicating which part failed, or a general one.
    // For simplicity, showing the first error.
    let errorMsg = 'Error fetching data.';
    if (isWeatherError) errorMsg = `Error fetching weather: ${weatherError?.message}`;
    else if (isImageError) errorMsg = `Error fetching image: ${imageError?.message}`;
    return (
      <div className="weather-bg">
        <span className="loader elements-show">{errorMsg}</span>
      </div>
    );
  }

  const formatDetails: FormatDetails | null = formatService ? formatService.getFormat() : null;

  return (
    <div className={`weather-app-react ${allDataLoaded ? 'content-visible' : 'content-hidden'}`}>
      <LoadingIndicator hidden={!isLoading && allDataLoaded} /> {/* Show loader if loading or if data isn't ready to be shown */}
      <div className="weather-border" style={{ backgroundColor: isLoading && !allDataLoaded ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0)' }}></div>
      <div className="weather-bg-animation" style={{ background: imageData && imageData.url && formatDetails ? `linear-gradient(344deg, rgba(255,255,255,0), #${formatDetails.backgroundColor})` : '' }}></div>
      <div className="weather-bg" style={{ background: imageData && imageData.url ? `url(${imageData.url}) no-repeat 50% center / cover` : '' }}>
        {formatDetails && <h1 className="greeting">{formatDetails.greeting}</h1>}

        {/* Use locationData from useQuery */}
        {locationData && formatService && <LocationDisplay locationData={locationData} formatService={formatService} />}

        {/* Use weatherData from useQuery */}
        {weatherData && formatService && <TemperatureDisplay weatherData={weatherData} unit={currentUnit} formatService={formatService} />}
        {weatherData && <WeatherDescription weatherData={weatherData} />}

        {<UnitConverter currentUnit={currentUnit} setCurrentUnit={setCurrentUnit} />}
      </div>
      <div className="credits">
        created by
        <a href="https://github.com/lucasbittar/" target="_blank" style={{ paddingLeft: '3px' }}>Lucas Bittar</a>.
      </div>
    </div>
  );
};

export default App;
