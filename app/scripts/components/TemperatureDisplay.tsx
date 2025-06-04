import React, { FC } from 'react';

// Assuming WeatherInfo and WeatherCurrently are defined as in App.tsx
// If these were in a shared types file, we'd import them.
interface WeatherCurrently {
  apparentTemperature: number;
  summary?: string; // Optional if not used here
  icon?: string;    // Optional if not used here
  // Add other relevant fields if necessary
}

interface WeatherInfo {
  currently: WeatherCurrently;
  // other top-level fields like daily, hourly, etc.
}

interface FormatService {
  fahrenheitCelsius: (tempF: number) => number;
  // Add other methods if used by this component
}

interface TemperatureDisplayProps {
  weatherData: WeatherInfo;
  unit: string; // 'F' or 'C'
  formatService: FormatService;
}

const TemperatureDisplay: FC<TemperatureDisplayProps> = ({ weatherData, unit, formatService }) => {
  if (!weatherData || !weatherData.currently || !formatService) {
    return null;
  }

  const tempF = Math.round(weatherData.currently.apparentTemperature);
  const tempC = formatService.fahrenheitCelsius(tempF);

  return (
    <div className="temp">
      <h3
        className={`temp-f ${unit === 'F' ? 'active' : ''}`}
        style={{ display: unit === 'F' ? 'inline-block' : 'none' }}
      >
        {tempF}
      </h3>
      <h3
        className={`temp-c ${unit === 'C' ? 'active' : ''}`}
        style={{ display: unit === 'C' ? 'inline-block' : 'none' }}
      >
        {tempC}
      </h3>
    </div>
  );
};

export default TemperatureDisplay;
