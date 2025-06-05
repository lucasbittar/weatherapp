import React, { FC } from 'react';

interface WeatherCurrently {
  apparentTemperature: number;
  summary?: string; // Optional if not used here
  icon?: string;    // Optional if not used here
}

interface WeatherInfo {
  currently: WeatherCurrently;
}

interface FormatService {
  celsiusFahrenheit: (tempF: number) => number;
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

  const tempC = Math.floor(weatherData.currently.apparentTemperature);
  const tempF = formatService.celsiusFahrenheit(tempC);

  return (
    <div className="temp">
      <h3
        className={`temp-f ${unit === 'F' ? 'active' : ''}`}
      >
        {tempF}˚F
      </h3>
      <h3
        className={`temp-c ${unit === 'C' ? 'active' : ''}`}
      >
        {tempC}˚C
      </h3>
    </div>
  );
};

export default TemperatureDisplay;
