import React, { useState, FC } from "react";
import { useQuery } from "@tanstack/react-query";
import locationService from "../services/location.service";
import weatherService from "../services/weather.service";
import imageService from "../services/image.service";
import formatService from "../services/format.service";

// Import components
import LoadingIndicator from "./LoadingIndicator";
import LocationDisplay from "./LocationDisplay";
import TemperatureDisplay from "./TemperatureDisplay";
import WeatherDescription from "./WeatherDescription";
import UnitConverter from "./UnitConverter";
import "../../styles/main.css";

// Import service return types (assuming they are exported from service files or a central types file)
// For this refactor, we'll use the interfaces as previously defined in this file,
// but ensure they match the actual service return shapes.

// LocationDetails from location.service.ts
interface LocationInfo {
  // Renaming from LocationDetails for consistency with previous App.tsx
  latitude: number;
  longitude: number;
  cityName: string;
  countryName?: string;
  stateName?: string; // Was regionName; stateName is more accurate from service
  stateAbbreviation?: string;
}

// WeatherInfoServiceOutput from weather.service.ts
interface WeatherInfo {
  // Renaming for consistency
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
interface ImageInfo {
  // Renaming for consistency
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
  const [currentUnit, setCurrentUnit] = useState<string>("C");

  // 1. Location Query
  const {
    data: locationData, // Renamed from locationInfo to avoid conflict if old state is still momentarily active
    isLoading: isLocationLoading,
    isError: isLocationError,
    error: locationError,
  } = useQuery<LocationInfo, Error>({
    retry: false,
    queryKey: ["location"],
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
    queryKey: ["weather", locationData?.latitude, locationData?.longitude],
    queryFn: () => {
      if (!locationData)
        throw new Error("Location not available for weather query");
      return weatherService.getInfo(
        locationData.latitude,
        locationData.longitude,
      );
    },
    enabled: !!locationData, // Only run if locationData is available
    staleTime: 8640000,
  });

  // 3. Image Query (dependent on locationData)
  const {
    data: imageData,
    isLoading: isImageLoading,
    isError: isImageError,
    error: imageError,
  } = useQuery<ImageInfo | null, Error>({
    // Image service can return null
    queryKey: ["image", locationData?.cityName],
    queryFn: () => {
      if (!locationData?.cityName)
        throw new Error("City name not available for image query");
      return imageService.search(`${locationData.cityName} ${locationData.stateName}`);
    },
    enabled: !!locationData?.cityName, // Only run if cityName is available
    staleTime: Infinity, // Image data for a city is unlikely to change frequently
  });

  const isLoading =
    isLocationLoading ||
    (!!locationData && (isWeatherLoading || isImageLoading));

  const allDataLoaded =
    !!locationData && !!weatherData && imageData !== undefined; // imageData can be null

  // Error handling: display first error encountered
  /*
  if (isLocationError) {
    return (
      <div className="weather-bg">
        <span className="loader elements-show">
          Error fetching location: {locationError?.message}
        </span>
      </div>
    );
  }
  */

  // Show specific errors for dependent queries if location succeeded
  const any_dependent_error = !!locationData && (isWeatherError || isImageError);

  const errorMessage = () => {

    let errorMsg = '';

    if (isLocationError) {
      errorMsg = `Location: ${locationError?.message}.\nTry again later.`;
    } else {
      if (any_dependent_error) {
        if (isWeatherError)
          errorMsg = `Weather: ${weatherError?.message}`;
        else if (isImageError)
          errorMsg = `Image: ${imageError?.message}`;

        return errorMsg
      }
    }
    return errorMsg
  }

  const formatDetails: FormatDetails | null = formatService
    ? formatService.getFormat()
    : null;

  return (
    <>
      <LoadingIndicator hidden={!isLoading && allDataLoaded} error={errorMessage()} />
      <div
        className={`weather-app-react ${allDataLoaded ? "content-visible" : "content-hidden"}`}
      >
        <div
          className="weather-border"
          style={{
            backgroundColor:
              isLoading && !allDataLoaded
                ? "rgba(0, 0, 0, 1)"
                : "rgba(0, 0, 0, 0)",
          }}
        ></div>
        <div
          className="weather-bg-animation"
          style={{
            background:
              imageData && imageData.url && formatDetails
                ? `linear-gradient(344deg, rgba(255,255,255,0), #${formatDetails.backgroundColor})`
                : "",
          }}
        ></div>
        <div
          className="weather-bg"
          style={{
            background:
              imageData && imageData.url
                ? `url(${imageData.url}) no-repeat 50% center / cover`
                : "",
          }}
        >
          {formatDetails && (
            <h1 className="greeting">{formatDetails.greeting}</h1>
          )}

          {locationData && formatService && (
            <LocationDisplay
              locationData={locationData}
              formatService={formatService}
            />
          )}

          {weatherData && formatService && (
            <TemperatureDisplay
              weatherData={weatherData}
              unit={currentUnit}
              formatService={formatService}
            />
          )}
          {weatherData && <WeatherDescription weatherData={weatherData} />}

          {
            <UnitConverter
              currentUnit={currentUnit}
              setCurrentUnit={setCurrentUnit}
            />
          }
        </div>
        <div className="credits">
          created by
          <a
            href="https://github.com/lucasbittar/"
            target="_blank"
            style={{ paddingLeft: "3px" }}
          >
            Lucas Bittar
          </a>
          .
        </div>
      </div>
    </>
  );
};

export default App;
