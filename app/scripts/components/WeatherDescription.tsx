import { FC } from 'react';
import { Theme } from '../context/ThemeContext';
import AsciiWeatherIcon from './AsciiWeatherIcon';

interface WeatherCurrently {
  apparentTemperature?: number;
  summary: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

interface WeatherInfo {
  currently: WeatherCurrently;
}

interface WeatherDescriptionProps {
  weatherData: WeatherInfo;
  theme: Theme;
}

const WeatherDescription: FC<WeatherDescriptionProps> = ({ weatherData, theme }) => {
  if (!weatherData || !weatherData.currently) {
    return null;
  }

  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  return (
    <div className="font-mono text-center my-6">
      {/* ASCII Weather Icon */}
      <div className="flex justify-center mb-4">
        <AsciiWeatherIcon
          icon={weatherData.currently.icon}
          theme={theme}
          size="large"
        />
      </div>

      {/* Weather Summary */}
      <div className={`${primaryClass} text-lg uppercase tracking-wide`} style={{
        textShadow: `0 0 5px ${primaryColor}`,
      }}>
        <span className={dimClass}>{'>'}</span> STATUS:{' '}
        <span className={brightClass}>{weatherData.currently.summary}</span>
      </div>
    </div>
  );
};

export default WeatherDescription;
