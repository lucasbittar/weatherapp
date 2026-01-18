import { FC } from 'react';
import { Theme } from '../context/ThemeContext';

interface WeatherCurrently {
  apparentTemperature: number;
  summary?: string;
  icon?: string;
}

interface WeatherInfo {
  currently: WeatherCurrently;
}

interface FormatService {
  celsiusFahrenheit: (tempF: number) => number;
}

interface TemperatureDisplayProps {
  weatherData: WeatherInfo;
  unit: string;
  formatService: FormatService;
  theme: Theme;
}

const TemperatureDisplay: FC<TemperatureDisplayProps> = ({
  weatherData,
  unit,
  formatService,
  theme,
}) => {
  if (!weatherData || !weatherData.currently || !formatService) {
    return null;
  }

  // Theme colors
  const primaryColor = theme === 'amber' ? '#ffb000' : '#00ff41';
  const brightClass = theme === 'amber' ? 'text-crt-amberBright' : 'text-crt-greenBright';
  const primaryClass = theme === 'amber' ? 'text-crt-amber' : 'text-crt-green';
  const dimClass = theme === 'amber' ? 'text-crt-amberDim' : 'text-crt-greenDim';

  const tempC = Math.floor(weatherData.currently.apparentTemperature);
  const tempF = formatService.celsiusFahrenheit(tempC);
  const displayTemp = unit === 'C' ? tempC : tempF;

  return (
    <div className="text-center my-6">
      {/* Large temperature display */}
      <div className="relative inline-block">
        <span
          className={`font-mono text-8xl font-bold ${brightClass} tracking-tighter`}
          style={{
            textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}99, 0 0 60px ${primaryColor}66`,
          }}
        >
          {displayTemp}
        </span>
        <span
          className={`font-mono text-5xl ${primaryClass} ml-1`}
          style={{
            textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}80`,
          }}
        >
          °{unit}
        </span>
      </div>

      {/* Decorative underline */}
      <div className="mt-2 flex justify-center">
        <div className={`${dimClass} font-mono text-xs tracking-widest`}>
          ════════════════
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;
