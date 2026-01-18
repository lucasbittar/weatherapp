import { FC } from 'react';
import { Theme } from '../context/ThemeContext';

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

// ASCII weather icons
const getAsciiIcon = (icon: string): string => {
  const icons: Record<string, string> = {
    'clear-day': '☀',
    'clear-night': '☾',
    'rain': '🌧',
    'snow': '❄',
    'sleet': '🌨',
    'wind': '💨',
    'fog': '🌫',
    'cloudy': '☁',
    'partly-cloudy-day': '⛅',
    'partly-cloudy-night': '☁☾',
  };
  return icons[icon] || '☁';
};

const WeatherDescription: FC<WeatherDescriptionProps> = ({ weatherData, theme }) => {
  if (!weatherData || !weatherData.currently) {
    return null;
  }

  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  const icon = getAsciiIcon(weatherData.currently.icon);

  return (
    <div className="font-mono text-center my-4">
      <div className="flex items-center justify-center gap-4">
        {/* Weather Icon */}
        <span
          className={`text-4xl ${brightClass}`}
          style={{
            textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80`,
          }}
        >
          {icon}
        </span>

        {/* Weather Summary */}
        <div className={`${primaryClass} text-lg uppercase tracking-wide`} style={{
          textShadow: `0 0 5px ${primaryColor}`,
        }}>
          <span className={dimClass}>{'>'}</span> STATUS:{' '}
          <span className={brightClass}>{weatherData.currently.summary}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherDescription;
